# FRD Generation System - Setup Instructions

## Quick Setup (3 Steps)

### Step 1: Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r ../requirements.txt
```

### Step 2: Configure Backend
```bash
# Edit .env file with your OpenAI API key
nano .env
# Add: OPENAI_API_KEY=sk-your-key-here
```

### Step 3: Start Services

**Terminal 1 - Backend:**
```bash
cd backend
source venv/bin/activate
python app.py
# Server running on http://localhost:5000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm install
npm start
# App running on http://localhost:3000
```

## 🎉 Done!

Open http://localhost:3000 in your browser and start generating FRDs!

## Next Steps

- Read QUICKSTART.md for detailed guide
- Check README.md for full documentation
- Review API_DOCS.md for API reference

## Need Help?

See QUICKSTART.md → Common Issues & Solutions
