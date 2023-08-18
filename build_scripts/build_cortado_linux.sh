#!/bin/sh

cd ./../src/backend
pip install -r requirements.txt
python3 -O -m PyInstaller --noconfirm --clean cortado-backend.spec
cp -r ./dist/cortado-backend ./../frontend/cortado-backend

cd ./../frontend
npm install
npm run build-electron-linux
cp -r ./cortado-backend ./app-dist/linux-unpacked
rm -r -f ./cortado-backend
