import os
import ssl
import json
import logging
from typing import List, Dict, Any, Tuple

# Disable SSL verification for corporate networks - must be set BEFORE importing huggingface libs
os.environ['CURL_CA_BUNDLE'] = ''
os.environ['REQUESTS_CA_BUNDLE'] = ''
os.environ['HF_HUB_DISABLE_SSL_VERIFY'] = '1'
os.environ['TRANSFORMERS_OFFLINE'] = '1'
os.environ['HF_HUB_OFFLINE'] = '1'

# Monkey-patch SSL to disable verification
ssl._create_default_https_context = ssl._create_unverified_context

import urllib3
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

# Patch httpx to disable SSL verification
try:
    import httpx
    httpx._config.DEFAULT_CIPHERS = None  # Use default ciphers
except:
    pass

from sentence_transformers import SentenceTransformer
import chromadb
from chromadb.config import Settings
import openai
from functools import lru_cache
import numpy as np

logger = logging.getLogger(__name__)


class SimpleEmbedder:
    """Fallback embedder using simple hashing when SentenceTransformer is not available"""
    
    def __init__(self, dimension=384):
        self.dimension = dimension
    
    def encode(self, texts, convert_to_numpy=True):
        """Create simple hash-based embeddings"""
        if isinstance(texts, str):
            texts = [texts]
        
        embeddings = []
        for text in texts:
            # Create a simple embedding based on character frequencies
            embedding = np.zeros(self.dimension)
            for i, char in enumerate(text.lower()):
                idx = hash(char) % self.dimension
                embedding[idx] += 1
            # Normalize
            norm = np.linalg.norm(embedding)
            if norm > 0:
                embedding = embedding / norm
            embeddings.append(embedding)
        
        return np.array(embeddings)

class RAGAgent:
    """Retrieval-Augmented Generation Agent for FRD processing"""
    
    def __init__(self, config):
        """Initialize RAG Agent with configuration"""
        self.config = config
        self.embedding_model = None
        self.chroma_client = None
        self.chroma_collection = None
        self.openai_client = None
        
        # Initialize components
        self._initialize_embeddings()
        self._initialize_chromadb()
        self._initialize_openai()
        
    def _initialize_embeddings(self):
        """Initialize sentence transformer for embeddings"""
        try:
            logger.info(f"Loading embedding model: {self.config.EMBEDDING_MODEL}")
            # Try loading with trust_remote_code and offline fallback
            try:
                # First try to load from cache (offline mode)
                self.embedding_model = SentenceTransformer(
                    self.config.EMBEDDING_MODEL,
                    trust_remote_code=True,
                    local_files_only=True
                )
                logger.info("Loaded embedding model from cache")
            except Exception as e:
                logger.warning(f"Could not load model from cache: {e}")
                try:
                    # Try online with SSL disabled
                    self.embedding_model = SentenceTransformer(
                        self.config.EMBEDDING_MODEL,
                        trust_remote_code=True
                    )
                    logger.info("Loaded embedding model from HuggingFace")
                except Exception as e2:
                    logger.warning(f"Could not load model online: {e2}")
                    # Use fallback simple embedder
                    logger.info("Using simple fallback embedder")
                    self.embedding_model = SimpleEmbedder()
        except Exception as e:
            logger.error(f"Failed to initialize embedding model: {str(e)}")
            # Use fallback embedder
            self.embedding_model = SimpleEmbedder()
    
    def _initialize_chromadb(self):
        """Initialize ChromaDB client and collection"""
        try:
            os.makedirs(self.config.CHROMADB_PATH, exist_ok=True)
            
            self.chroma_client = chromadb.PersistentClient(
                path=self.config.CHROMADB_PATH
            )
            
            # Create or get existing collection
            self.chroma_collection = self.chroma_client.get_or_create_collection(
                name="frd_documents",
                metadata={"hnsw:space": "cosine"}
            )
            
            logger.info("ChromaDB initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize ChromaDB: {str(e)}")
            raise
    
    def _initialize_openai(self):
        """Initialize Azure OpenAI client"""
        try:
            from openai import AzureOpenAI
            
            self.openai_client = AzureOpenAI(
                azure_endpoint=os.getenv("AZURE_OPENAI_ENDPOINT"),
                api_key=os.getenv("AZURE_OPENAI_API_KEY"),
                api_version=os.getenv("AZURE_OPENAI_API_VERSION", "2025-04-01-preview")
            )
            self.deployment_name = os.getenv("AZURE_OPENAI_DEPLOYMENT_NAME", "gpt-4o")
            logger.info("Azure OpenAI client initialized")
        except Exception as e:
            logger.error(f"Failed to initialize Azure OpenAI: {str(e)}")
            raise
    
    def add_document_to_db(self, doc_id: str, content: str, metadata: Dict = None) -> bool:
        """Add document to ChromaDB"""
        try:
            chunks = self._chunk_text(content)
            
            ids = [f"{doc_id}_chunk_{i}" for i in range(len(chunks))]
            metadatas = [{"doc_id": doc_id, "chunk": i, **(metadata or {})} for i in range(len(chunks))]
            
            self.chroma_collection.add(
                ids=ids,
                documents=chunks,
                metadatas=metadatas
            )
            
            logger.info(f"Document {doc_id} added with {len(chunks)} chunks")
            return True
        except Exception as e:
            logger.error(f"Failed to add document: {str(e)}")
            return False
    
    def retrieve_similar_documents(self, query: str, n_results: int = 5) -> List[Dict[str, Any]]:
        """Retrieve similar documents from ChromaDB"""
        try:
            results = self.chroma_collection.query(
                query_texts=[query],
                n_results=n_results,
                include=["documents", "metadatas", "distances"]
            )
            
            documents = []
            if results and results['documents']:
                for i, doc in enumerate(results['documents'][0]):
                    documents.append({
                        'content': doc,
                        'metadata': results['metadatas'][0][i] if results['metadatas'] else {},
                        'distance': results['distances'][0][i] if results['distances'] else 0
                    })
            
            return documents
        except Exception as e:
            logger.error(f"Failed to retrieve documents: {str(e)}")
            return []
    
    def _chunk_text(self, text: str, chunk_size: int = None, overlap: int = None) -> List[str]:
        """Split text into chunks for better processing"""
        chunk_size = chunk_size or self.config.CHUNK_SIZE
        overlap = overlap or self.config.CHUNK_OVERLAP
        
        chunks = []
        start = 0
        
        while start < len(text):
            end = start + chunk_size
            chunk = text[start:end]
            chunks.append(chunk)
            start = end - overlap
        
        return chunks
    
    def understand_requirement(self, requirement: str) -> Dict[str, Any]:
        """Use GPT to understand and analyze requirement"""
        try:
            prompt = f"""Analyze this business requirement and extract key information:

{