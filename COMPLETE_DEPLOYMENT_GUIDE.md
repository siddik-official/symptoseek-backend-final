# 🚀 Complete Deployment Guide for SymptoSeek Backend

## Step 1: Set Up Your External Services

### 1.1 MongoDB Database
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free account or sign in
3. Create a new cluster (M0 Sandbox - Free)
4. Create a database user:
   - Go to "Database Access" → "Add New Database User"
   - Create username/password (save these!)
5. Whitelist your IP:
   - Go to "Network Access" → "Add IP Address"
   - Add `0.0.0.0/0` (allow from anywhere) for Render
6. Get connection string:
   - Go to "Clusters" → "Connect" → "Connect your application"
   - Copy the connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/`)

### 1.2 Cloudinary (for file uploads)
1. Go to [Cloudinary](https://cloudinary.com)
2. Create a free account
3. Go to Dashboard → Copy these values:
   - Cloud Name
   - API Key  
   - API Secret

### 1.3 Email Service (Gmail recommended)
1. Use your Gmail account
2. Enable 2-factor authentication
3. Generate an App Password:
   - Go to Google Account → Security → 2-Step Verification → App Passwords
   - Select "Mail" and generate password
   - Save this 16-character password (like: `abcd efgh ijkl mnop`)

## Step 2: Deploy to Render

### 2.1 Push to GitHub
```bash
# In your SymptoSeek-Backend folder
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git branch -M main  
git push -u origin main
```

### 2.2 Create Render Service
1. Go to [Render.com](https://render.com)
2. Sign up/Login with GitHub
3. Click "New" → "Web Service"
4. Connect your backend repository
5. Configure:
   - **Name**: `symptoseek-backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free

### 2.3 Set Environment Variables in Render
In your Render service dashboard, go to "Environment" and add these:

```
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/symptoseek
JWT_SECRET=your_super_long_random_string_here_make_it_at_least_32_characters
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key  
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_16_character_app_password
```

## Step 3: Generate JWT Secret
Run this in any terminal to generate a secure JWT secret:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## Step 4: Test Your Deployment
After deployment, test these URLs:
- `https://your-app-name.onrender.com/api/health` - Should return health status
- `https://your-app-name.onrender.com/api/auth/profile` - Should return 401 (expected)

## Step 5: Update Frontend URLs
In your Vercel-deployed frontend, update the API configuration to use your new Render URLs:
```javascript
// In your frontend config
BASE_URL: 'https://your-app-name.onrender.com'
FLASK_URL: 'https://your-app-name.onrender.com' // Same URL since Flask is integrated
```

## Example Environment Variables

Here are example values (replace with your real ones):

```
MONGODB_URI=mongodb+srv://myuser:mypassword@cluster0.abc123.mongodb.net/symptoseek
JWT_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2
CLOUDINARY_CLOUD_NAME=my-cloud-name
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=abcdefghijklmnopqrstuvwxyz123456
EMAIL_USER=myapp@gmail.com
EMAIL_PASS=abcd efgh ijkl mnop
```

## Troubleshooting

### Common Issues:
1. **MongoDB Connection Failed**: Check if IP is whitelisted and credentials are correct
2. **JWT Errors**: Ensure JWT_SECRET is at least 32 characters
3. **Email Not Working**: Verify app password is generated correctly
4. **Build Fails**: Check if all dependencies are in package.json

### Logs:
- Check Render logs in your service dashboard
- Look for specific error messages

## Next Steps After Deployment:
1. Test all API endpoints
2. Update frontend to use new backend URL
3. Test file upload functionality
4. Monitor logs for any issues
