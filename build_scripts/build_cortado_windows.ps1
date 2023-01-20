# PLEASE NOTE:
# run with admin rights and make sure the correct venv of python is activated

Write-Output Get-Location
$originalPath = (Get-Item .).FullName

# build backend
Write-Output "BUILD BACKEND"
cd ./../src/backend
python -O -m PyInstaller --noconfirm --clean cortado-backend.spec

Write-Output "BUILD FRONTEND"
cd ./../frontend
npm run electron-builder-app-production-windows
Get-Location

Write-Output "COPY FILES"
cd ./../backend/
Remove-Item -Recurse -Force ./../frontend/app-dist/cortado-backend/
New-Item -ItemType Directory -Path ./../frontend/app-dist/cortado-backend/
Copy-Item -Path ./dist/cortado-backend/* -Destination ./../frontend/app-dist/cortado-backend/ -Recurse

Write-Output "OPEN WINDOWS EXPLORER"
Invoke-Item ./../frontend/app-dist/

Write-Output "RESET PATH"
cd $originalPath