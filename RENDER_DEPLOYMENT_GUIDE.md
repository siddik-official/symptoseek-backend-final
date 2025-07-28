# 🚀 SymptoSeek Backend - Render Deployment Guide

## Step 1: Push to GitHub

```bash
# Add your GitHub repository URL here
git remote add origin YOUR_GITHUB_REPO_URL
git branch -M main
git push -u origin main
```

## Step 2: Deploy on Render

### Option A: Simple Single Service (Recommended for Free Plan)

1. Go to [Render Dashboard](https://render.com/dashboard)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: `symptoseek-backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free

### Option B: Two Separate Services (If you need Flask separately)

#### Service 1: Node.js Backend
- **Name**: `symptoseek-api`
- **Environment**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `npm start`

#### Service 2: Flask ML Service
- **Name**: `symptoseek-ml`
- **Environment**: `Python`
- **Build Command**: `cd backend_flask && pip install -r requirement.txt`
- **Start Command**: `cd backend_flask && python app.py`

## Step 3: Environment Variables

Add these in Render dashboard under "Environment":

```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/symptoseek
JWT_SECRET=your_very_long_secure_random_string_here
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
NODE_ENV=production
```

## Step 4: Update Frontend

After deployment, update your Vercel frontend to use the new backend URL:

In your frontend `config/api.ts`:
```typescript
export const API_CONFIG = {
  BASE_URL: 'https://symptoseek-backend.onrender.com',
  FLASK_URL: 'https://symptoseek-backend.onrender.com', // Same service handles both
  // ... rest of config
}
```

## Step 5: Test Deployment

1. Visit your Render service URL
2. Test endpoints:
   - `GET /api/health` - Should return health status
   - `POST /api/auth/register` - Test user registration
   - `POST /api/upload-report` - Test file upload

## Important Notes

- Free tier services sleep after 15 minutes of inactivity
- First request after sleeping may take 30+ seconds
- Consider upgrading to paid plan for production use
- Your backend will be available at: `https://your-service-name.onrender.com`

## Troubleshooting

1. **Build fails**: Check logs in Render dashboard
2. **Service won't start**: Verify environment variables are set
3. **Database connection fails**: Check MongoDB connection string
4. **File uploads fail**: Verify Cloudinary credentials

## Your Service URLs

After deployment, your services will be available at:
- Main Backend: `https://symptoseek-backend.onrender.com`
- Health Check: `https://symptoseek-backend.onrender.com/api/health`

Update your frontend to use these URLs!
