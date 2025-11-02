# SevaOnline Backend

## Prerequisites
- MongoDB running on localhost:27017 (for local development)
- Node.js installed (already detected at C:\Program Files\nodejs)

## Setup Instructions

1. **Start the Backend Server:**
   - Double-click on `start_server.bat` in the backend folder
   - OR run the following command in Command Prompt:
     ```
     cd c:\xampp\htdocs\src\sevaonline\backend
     "C:\Program Files\nodejs\node.exe" src/server.js
     ```

2. **Create Test Users (Optional but Recommended):**
   - Double-click on `create_test_users.bat` in the backend folder
   - OR run the following command in Command Prompt:
     ```
     cd c:\xampp\htdocs\src\sevaonline\backend
     "C:\Program Files\nodejs\node.exe" src/createTestUsers.js
     ```

## API Endpoints
- Base URL: http://localhost:5000
- Health Check: http://localhost:5000/health
- User Login: POST http://localhost:5000/api/users/login
- User Registration: POST http://localhost:5000/api/users/register

## Test Credentials
- Patient: patient1 / patient123
- Patient: patient2 / patient123
- Doctor: doctor1 / doctor123
- Reception: reception1 / reception123
- Admin: admin1 / admin123

## Deployment to Render

Follow the instructions in [DEPLOYMENT.md](DEPLOYMENT.md) to deploy this backend to Render.

## Troubleshooting
- If you get "MongoDB connection failed" error, ensure MongoDB is running
- If you get "Port already in use" error, change PORT in .env file
- If you get "Module not found" errors, run `npm install` in the backend directory