import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    """Base configuration"""
    DEBUG = False
    TESTING = False
    SECRET_KEY = os.getenv('SECRET_KEY', 'your-secret-key-change-in-production')
    OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
    
    # File paths
    UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), '../uploads')
    GENERATED_FOLDER = os.path.join(os.path.dirname(__file__), '../generated')
    CHROMADB_PATH = os.path.join(os.path.dirname(__file__), '../chromadb_data')
    
    # ChromaDB settings
    EMBEDDING_MODEL = 'all-MiniLM-L6-v2'
    CHUNK_SIZE = 500
    CHUNK_OVERLAP = 50
    
    # API settings
    CORS_ORIGINS = ['http://localhost:3000', 'http://localhost:5000']
    MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
    ALLOWED_EXTENSIONS = {'pdf', 'docx', 'txt', 'xlsx', 'xls'}
    
    # Generation settings
    MODEL_NAME = 'gpt-3.5-turbo'
    MAX_TOKENS = 4000
    TEMPERATURE = 0.7

class DevelopmentConfig(Config):
    """Development configuration"""
    DEBUG = True
    TESTING = False

class ProductionConfig(Config):
    """Production configuration"""
    DEBUG = False
    TESTING = False

class TestingConfig(Config):
    """Testing configuration"""
    DEBUG = True
    TESTING = True

config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig
}

def get_config():
    env = os.getenv('FLASK_ENV', 'development')
    return config.get(env, config['default'])
