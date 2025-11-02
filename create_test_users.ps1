# PowerShell script to create test users for SevaOnline
Write-Host "Creating test users for SevaOnline..." -ForegroundColor Green
Set-Location -Path "c:\xampp\htdocs\src\sevaonline\backend"
& "C:\Program Files\nodejs\node.exe" src/createTestUsers.js