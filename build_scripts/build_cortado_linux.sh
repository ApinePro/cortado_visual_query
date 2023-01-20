#!/bin/sh

cd ./../src/backend
pip install -r requirements.txt
python -O -m PyInstaller --noconfirm --clean cortado-backend.spec
cp -r ./dist/cortado-backend ./../frontend/cortado-backend
cd ./../frontend
npm run electron-builder-app-production-linux
rm -r -f ./cortado-backend