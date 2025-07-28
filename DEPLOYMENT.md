# SymptoSeek Backend - Render Deployment

This is the backend service for SymptoSeek, optimized for Render deployment.

## Quick Deploy to Render

### Step 1: Push to GitHub
```bash
git init
git add .
git commit -m "Initial backend deployment"
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

### Step 2: Deploy on Render

1. Go to [Render](https://render.com)
2. Connect your GitHub repository
3. Create two services:

#### Service 1: Node.js Backend
- **Name**: `symptoseek-backend`
- **Environment**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Port**: `10000`

#### Service 2: Flask ML Service
- **Name**: `symptoseek-flask`
- **Environment**: `Python`
- **Build Command**: `cd backend_flask && pip install -r requirement.txt`
- **Start Command**: `cd backend_flask && python app.py`
- **Port**: `5001`

### Step 3: Environment Variables

Set these in Render dashboard:

#### For Node.js Service:
```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
EMAIL_USER=your_email
EMAIL_PASS=your_email_password
PORT=10000
NODE_ENV=production
```

#### For Flask Service:
```
FLASK_ENV=production
PORT=5001
```

## API Endpoints

### Node.js Service (Main Backend)
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/doctors` - Get doctors
- `POST /api/appointments` - Book appointments
- `GET /api/chat/history` - Chat history

### Flask Service (ML/AI)
- `POST /api/upload-report` - Medical report analysis
- `POST /api/symptoms` - Symptom processing

## After Deployment

Your services will be available at:
- Node.js: `https://symptoseek-backend.onrender.com`
- Flask: `https://symptoseek-flask.onrender.com`

Update your frontend (Vercel) to use these URLs in the API configuration.
