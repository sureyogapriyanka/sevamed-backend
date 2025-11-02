@echo off
echo Creating test users for SevaOnline...
cd /d "c:\xampp\htdocs\src\sevaonline\backend"
"C:\Program Files\nodejs\node.exe" src/createTestUsers.js
pause