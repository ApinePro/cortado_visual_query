#!/bin/sh

cd ./backend
#pip3 install -r requirements.txt
pip3 uninstall -y cvxopt
python3 -O -m PyInstaller --noconfirm --clean cortado-backend-macos.spec
cp -r ./dist/cortado-backend ./../frontend/cortado-backend
cd ./../frontend
npm run electron-builder-app-production-macos
rm -r -f ./cortado-backend