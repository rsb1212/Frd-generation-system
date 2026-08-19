# FRD Generation System

Automated Functional Requirements Document (FRD) generation using AI, RAG (Retrieval-Augmented Generation), and modern web technologies.

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Usage Examples](#usage-examples)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)

## 🎯 Overview

The FRD Generation System is a full-stack web application that automates the creation of comprehensive Functional Requirements Documents. It uses:

- **Backend**: Flask with OpenAI GPT for content generation
- **Database**: ChromaDB for intelligent document retrieval
- **Frontend**: React with modern UI/UX
- **AI**: Sentence transformers for embeddings and RAG

## 🏗️ Architecture

```
┌─────────────┐
│   React     │
│  Frontend   │
└──────┬──────┘
       │ HTTP/REST
       ▼
┌─────────────┐      ┌──────────┐
│   Flask     │◄────►│  ChromaDB│
│   Backend   │      └──────────┘
└──────┬──────┘
       │
       ▼
┌─────────────────────┐
│  OpenAI API (GPT)   │
│ + RAG Processing    │
└─────────────────────┘
```

## ✨ Features

### Frontend
- ✅ Intuitive React-based UI
- ✅ Real-time form validation
- ✅ File upload with progress tracking
- ✅ Multi-format output (DOCX & PDF)
- ✅ Template selection system
- ✅ File management and downloads
- ✅ API status monitoring
- ✅ Responsive design
- ✅ Dark mode support

### Backend
- ✅ REST API with comprehensive endpoints
- ✅ RAG Agent for intelligent processing
- ✅ ChromaDB integration for document retrieval
- ✅ OpenAI GPT integration
- ✅ DOCX and PDF generation
- ✅ Error handling and validation
- ✅ CORS support
- ✅ Logging and monitoring

### Core Functionality
- ✅ Intelligent requirement analysis
- ✅ Similar document retrieval
- ✅ Multi-section FRD generation
- ✅ Template-based document structure
- ✅ Embedded content with metadata
- ✅ Document versioning

## 📦 Prerequisites

### System Requirements
- Python 3.8+
- Node.js 14+
- npm or yarn
- 4GB RAM minimum
- 1GB disk space for ChromaDB

### External Services
- OpenAI API key (for GPT access)
- LibreOffice (optional, for PDF generation)

## 🚀 Installation

### 1. Clone Repository
```bash
git clone <repository-url>
cd frd-generation-system
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r ../requirements.txt

# Create necessary directories
mkdir -p uploads generated chromadb_data
```

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Or using yarn
yarn install
```

## ⚙️ Configuration

### Backend Configuration (.env)

```env
# Flask
FLASK_ENV=development
SECRET_KEY=your-secret-key

# OpenAI
OPENAI_API_KEY=sk-xxx...

# Server
PORT=5000
DEBUG=True

# File Upload
MAX_FILE_SIZE=10485760
ALLOWED_EXTENSIONS=pdf,docx,txt

# ChromaDB
EMBEDDING_MODEL=all-MiniLM-L6-v2

# CORS
CORS_ORIGINS=http://localhost:3000,http://localhost:5000
```

### Frontend Configuration (.env)

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_ENV=development
```

## 🏃 Running the Application

### Development Mode

**Terminal 1 - Backend:**
```bash
cd backend
source venv/bin/activate  # or: venv\Scripts\activate on Windows
python app.py
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api

### Production Mode

**Using Gunicorn (Backend):**
```bash
cd backend
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

**Using Build + Serve (Frontend):**
```bash
cd frontend
npm run build
npx serve -s build
```

## 📡 API Documentation

### Health Check
```http
GET /api/health
```

### Generate FRD
```http
POST /api/frd/generate
Content-Type: application/json

{
  "requirement": "string",
  "user_info": {
    "project_name": "string",
    "author": "string"
  },
  "format": "docx|pdf|both"
}
```

### Analyze Requirement
```http
POST /api/requirements/analyze
Content-Type: application/json

{
  "requirement": "string"
}
```

### Retrieve Similar Documents
```http
POST /api/requirements/retrieve-similar
Content-Type: application/json

{
  "query": "string",
  "n_results": 5
}
```

### Upload File
```http
POST /api/files/upload
Content-Type: multipart/form-data

file: <binary>
```

### Download File
```http
GET /api/files/download/<filename>
```

### List Generated Files
```http
GET /api/files/list
```

## 💡 Usage Examples

### Example 1: Generate FRD from Requirement

1. Navigate to http://localhost:3000
2. Click "Generate FRD" tab
3. Enter your business requirement
4. Select output format (DOCX, PDF, or Both)
5. Click "Generate FRD"
6. Download generated files from "Files" tab

### Example 2: Use Template

1. Click "Templates" tab
2. Select desired template (Enterprise, SaaS, Mobile, etc.)
3. Review template sections
4. Use template for future generations

### Example 3: Upload Reference Documents

1. In the form, use the file upload section
2. Upload similar FRDs, SOPs, or requirements
3. System will use these as context for generation
4. Better context = Better FRD quality

## 🔧 Troubleshooting

### Issue: "OpenAI API Key not set"
**Solution**: Set OPENAI_API_KEY in backend/.env

### Issue: "ChromaDB connection failed"
**Solution**: Ensure chromadb_data directory has write permissions

### Issue: "PDF generation failed"
**Solution**: Install LibreOffice or ensure reportlab fallback works

### Issue: "CORS errors in browser"
**Solution**: Check CORS_ORIGINS in .env and ensure frontend URL is included

### Issue: "Large file uploads timeout"
**Solution**: Increase MAX_FILE_SIZE in .env and adjust server timeout

## 📊 Performance Optimization

### Backend Optimization
- Use caching for frequently accessed embeddings
- Implement rate limiting
- Optimize ChromaDB queries
- Use connection pooling

### Frontend Optimization
- Code splitting for faster loading
- Image optimization
- Lazy loading of components
- Caching strategies

## 🔒 Security Considerations

1. **API Key Management**: Never commit .env files
2. **Input Validation**: All inputs are validated
3. **CORS Configuration**: Restrict to known origins
4. **File Upload**: Validate file types and sizes
5. **Error Handling**: Avoid exposing sensitive information

## 📚 Project Structure

```
frd-generation-system/
├── backend/
│   ├── app.py                 # Main Flask app
│   ├── config.py              # Configuration
│   ├── rag_agent.py           # RAG implementation
│   ├── document_processor.py   # Document generation
│   ├── .env                   # Environment variables
│   ├── uploads/               # Uploaded files
│   ├── generated/             # Generated documents
│   └── chromadb_data/         # Vector database
├── frontend/
│   ├── src/
│   │   ├── App.jsx            # Main app component
│   │   ├── App.css            # Global styles
│   │   ├── components/
│   │   │   ├── Header.jsx
│   │   │   ├── FRDForm.jsx
│   │   │   ├── FileList.jsx
│   │   │   ├── TemplateSelector.jsx
│   │   │   └── *.css          # Component styles
│   │   └── index.js           # Entry point
│   ├── package.json
│   ├── .env                   # Environment variables
│   └── public/
├── requirements.txt           # Python dependencies
└── README.md
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 📧 Support

For issues, questions, or suggestions, please create an issue in the repository.

## 🗺️ Roadmap

- [ ] Multi-language support
- [ ] Advanced analytics
- [ ] Collaboration features
- [ ] Custom template creation
- [ ] Document versioning
- [ ] Automated testing
- [ ] Mobile app
- [ ] Database integration (PostgreSQL)
- [ ] User authentication
- [ ] Document sharing

---

**Last Updated**: 2024
**Version**: 1.0.0

Target uri-https://bl-prod02-opai-productchangeanalyzer-01.openai.azure.com/openai/responses?api-version=2025-04-01-preview
key-

 
