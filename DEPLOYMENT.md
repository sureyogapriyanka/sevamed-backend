# Deploying SevaOnline Backend to Render

This guide explains how to deploy the SevaOnline backend to Render.

## Prerequisites

1. A Render account (https://render.com)
2. Your MongoDB Atlas database connection string
3. Your JWT secret key

## Deployment Steps

### 1. Fork the Repository (Optional)
If you want to make changes or keep your deployment separate from the main repository, fork it first.

### 2. Create a New Web Service on Render
1. Go to your Render dashboard
2. Click "New" and select "Web Service"
3. Connect your GitHub repository or use the Git URL
4. Set the following options:
   - **Name**: sevaonline-backend
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Branch**: main (or your preferred branch)

### 3. Configure Environment Variables
In the Render dashboard, go to your service settings and add the following environment variables:

| Key | Value |
|-----|-------|
| NODE_ENV | production |
| MONGODB_URI | mongodb+srv://ypsure:chinnu0345@sevaonline.8zwq9ed.mongodb.net/sevaonline |
| JWT_SECRET | your-jwt-secret-key |

Note: Make sure to use your actual MongoDB connection string and a secure JWT secret.

### 4. Deploy
Click "Create Web Service" and Render will automatically deploy your application.

## Health Check
Once deployed, you can check the health of your application at:
`https://your-app-name.onrender.com/health`

## API Endpoints
Your API will be available at:
`https://your-app-name.onrender.com/api/`

## Auto-Deployment
Render will automatically redeploy your application whenever you push changes to your connected branch.

## Troubleshooting
1. If the deployment fails, check the logs in the Render dashboard
2. Ensure all environment variables are correctly set
3. Verify your MongoDB Atlas connection string is correct and the database is accessible
4. Check that the PORT environment variable is not hardcoded in your application

## Scaling
Render automatically handles scaling for you. For custom scaling options, check the Render documentation.