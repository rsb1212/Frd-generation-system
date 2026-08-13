# FRD Generation System - Quick Start Guide

Get up and running in 5 minutes!

## Prerequisites

- Python 3.8+
- Node.js 14+
- OpenAI API Key
- Git

## 1️⃣ Clone and Setup

```bash
# Clone repository
git clone <repository-url>
cd frd-generation-system

# Create directories
mkdir -p backend/uploads backend/generated backend/chromadb_data
mkdir -p frontend/public frontend/src/components
```

## 2️⃣ Backend Setup (Terminal 1)

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate (macOS/Linux)
source venv/bin/activate
# OR activate (Windows)
venv\Scripts\activate

# Install dependencies
pip install -r ../requirements.txt

# Configure environment
cp .env.example .env

# Edit .env and add your OpenAI API key:
# OPENAI_API_KEY=sk-your-key-here

# Start server
python app.py
```

Backend will run on: **http://localhost:5000**

## 3️⃣ Frontend Setup (Terminal 2)

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

Frontend will open at: **http://localhost:3000**

## 4️⃣ First Run

### Generate Your First FRD

1. Open http://localhost:3000
2. Click **"Generate FRD"** tab
3. Enter a business requirement:

```
Build a customer relationship management system that helps sales teams track leads, 
manage contacts, and monitor sales pipelines. The system must support real-time analytics, 
automated reporting, email integration, calendar synchronization, and role-based access control 
for different team levels.
```

4. Enter optional details:
   - Project Name: "CRM System"
   - Author: "Your Name"

5. Select output format: **Both (DOCX & PDF)**

6. Click **"Generate FRD"**

7. Wait for generation (~30-60 seconds)

8. Go to **"Files"** tab and download your generated documents

## 5️⃣ Try Templates

1. Click **"Templates"** tab
2. Select a template (Enterprise, SaaS, Mobile, etc.)
3. Review the included sections
4. Use this template when generating FRDs

## 6️⃣ Upload Reference Documents

1. In **"Generate FRD"** form, use **"Upload Reference Files"**
2. Upload similar FRDs or requirements
3. System will use them as context for better generation

---

## Common Issues & Solutions

### Issue: "OpenAI API Key not set"
**Solution**: Add your key to `backend/.env`
```env
OPENAI_API_KEY=sk-your-actual-key-here
```

### Issue: "Port 5000 already in use"
**Solution**: Change port in `backend/app.py`
```python
app.run(port=5001)
```

### Issue: "Port 3000 already in use"
**Solution**: Use different port
```bash
PORT=3001 npm start
```

### Issue: ChromaDB errors
**Solution**: Clear and reinitialize
```bash
rm -rf backend/chromadb_data
mkdir backend/chromadb_data
```

### Issue: Module not found
**Solution**: Ensure virtual environment is activated
```bash
# Check (you should see (venv) in terminal)
which python
# Should show path to venv/bin/python
```

---

## Project Structure Overview

```
frd-generation-system/
├── backend/
│   ├── app.py                    # Main Flask application
│   ├── rag_agent.py              # AI/ML RAG logic
│   ├── document_processor.py      # Document generation
│   ├── config.py                 # Configuration
│   ├── .env                      # Environment variables (create this)
│   ├── venv/                     # Virtual environment (created by setup)
│   ├── uploads/                  # Uploaded files
│   ├── generated/                # Generated documents
│   └── chromadb_data/            # Vector database
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx               # Main React component
│   │   ├── App.css               # Global styles
│   │   ├── components/           # React components
│   │   │   ├── Header.jsx
│   │   │   ├── FRDForm.jsx
│   │   │   ├── FileList.jsx
│   │   │   ├── TemplateSelector.jsx
│   │   │   └── *.css             # Component styles
│   │   └── index.js              # Entry point
│   ├── public/                   # Static files
│   ├── package.json              # Dependencies
│   └── .env                      # Environment variables
│
├── requirements.txt              # Python dependencies
├── README.md                     # Full documentation
├── API_DOCS.md                   # API reference
├── DEPLOYMENT.md                 # Production guide
└── QUICKSTART.md                 # This file
```

---

## Key Features to Explore

### 📄 Generate FRD
- Input business requirements
- Select output format (DOCX, PDF, or both)
- Automatic multi-section document generation
- Real-time form validation

### 📋 Templates
- 6 pre-built templates (Enterprise, SaaS, Mobile, Web, API, Integration)
- Customizable sections
- Best practice guidance

### 📁 File Management
- Upload reference documents
- Download generated files
- Sort and filter files
- File size and date tracking

### 🔍 Smart Retrieval
- Automatic similar document detection
- Context-aware content generation
- Embeddings-based search

---

## Next Steps

### Learn More
- 📖 Read [README.md](./README.md) for full documentation
- 🔌 Check [API_DOCS.md](./API_DOCS.md) for API details
- 🚀 See [DEPLOYMENT.md](./DEPLOYMENT.md) for production setup

### Customize
- Modify templates in `backend/rag_agent.py`
- Adjust styling in `frontend/src/*.css`
- Add new endpoints in `backend/app.py`

### Advanced Usage
- Upload custom reference documents
- Integrate with your own systems
- Extend with additional features

---

## Tips for Best Results

✅ **Do:**
- Be specific in requirements (50+ characters minimum)
- Include use cases and workflows
- Upload similar documents as reference
- Review and edit generated content
- Store generated documents for future reference

❌ **Don't:**
- Use vague or brief requirements
- Generate without understanding your needs
- Rely 100% on AI output
- Skip proofreading
- Forget to save your API key securely

---

## Performance Tips

- **First run** takes longer due to model initialization (1-2 minutes)
- **Subsequent runs** are faster (10-30 seconds)
- **Large documents** (100+ pages) may take up to 2 minutes
- **Batch operations** work better than single uploads

---

## Get Help

### Stuck?
1. Check the [Troubleshooting](./README.md#troubleshooting) section
2. Review [API documentation](./API_DOCS.md)
3. Check logs: `tail -f backend/logs.txt`
4. Search GitHub issues

### Report Issues
Create an issue with:
- Error message
- Steps to reproduce
- System info (OS, Python version, Node version)
- Screenshots if applicable

---

## What's Next?

After generating your first FRD:

1. **Download and Review**: Check the generated DOCX/PDF files
2. **Customize**: Edit as needed for your specific project
3. **Share**: Collaborate with your team
4. **Iterate**: Upload your edited documents and generate updated versions
5. **Archive**: Keep generated files for future reference

---

## Example Workflow

```
1. Business asks for CRM system
   ↓
2. Enter requirement into system
   ↓
3. Upload similar CRM docs from past projects
   ↓
4. System generates comprehensive FRD
   ↓
5. Review generated document
   ↓
6. Make edits and customizations
   ↓
7. Download final DOCX/PDF
   ↓
8. Share with development team
   ↓
9. Use for project planning and estimation
```

---

## Keyboard Shortcuts

- `Enter` in form: Submit (when valid)
- `Ctrl/Cmd + R`: Refresh file list
- `Ctrl/Cmd + S`: Save/Download file (in browser)

---

## System Requirements Check

Run this to verify your setup:

```bash
# Check Python
python --version  # Should be 3.8+

# Check Node
node --version  # Should be 14+
npm --version   # Should be 6+

# Check pip
pip --version   # Should be 20+
```

---

## Still Having Issues?

1. **Clear cache and reinstall**:
```bash
rm -rf backend/venv
rm -rf frontend/node_modules
python -m venv backend/venv
npm --prefix frontend install
```

2. **Check system resources**:
```bash
# Memory
free -h (Linux) or top (macOS)

# Disk space
df -h
```

3. **Review logs**:
```bash
# Backend logs
tail -f backend.log

# Browser console
F12 → Console tab
```

---

## Production Readiness Checklist

Before deploying to production:

- [ ] API key secured (not in git)
- [ ] Error handling configured
- [ ] Logging enabled
- [ ] CORS origins configured
- [ ] Rate limiting enabled
- [ ] Database backed up
- [ ] SSL/TLS certificates set up
- [ ] Monitoring configured
- [ ] Backups automated
- [ ] Documentation updated

See [DEPLOYMENT.md](./DEPLOYMENT.md) for details.

---

**Happy FRD generating! 🚀**

*For detailed documentation, see README.md*
*For API details, see API_DOCS.md*
*For production setup, see DEPLOYMENT.md*

---

**Version**: 1.0.0
**Last Updated**: 2024
