# -*- mode: python ; coding: utf-8 -*-
import sys ; sys.setrecursionlimit(sys.getrecursionlimit() * 5)

block_cipher = None


a = Analysis(['cortado-backend.py'],
             pathex=['C:\\Users\\dschuste\\Documents\\git_repos\\fraunhofer_git\\interactive-process-mining\\backend'],
             binaries=[('C:/Users/dschuste/Documents/git_repos/fraunhofer_git/interactive-process-mining_venv/Lib/site-packages/cvxopt','cvxopt')],
             datas=[('C:/Users/dschuste/Documents/git_repos/fraunhofer_git/interactive-process-mining_venv/Lib/site-packages/pulp/*','.'),
             ('C:/Users/dschuste/Documents/git_repos/fraunhofer_git/interactive-process-mining_venv/Lib/site-packages/cvxopt/*','.')],
             hiddenimports=['uvicorn.logging',
                            'uvicorn.loops',
                            'uvicorn.loops.auto',
                            'uvicorn.protocols',
                            'uvicorn.protocols.http',
                            'uvicorn.protocols.http.auto',
                            'uvicorn.protocols.websockets',
                            'uvicorn.protocols.websockets.auto',
                            'uvicorn.lifespan',
                            'uvicorn.lifespan.on',
                            'pulp',
                            'OpenBLAS'],
             hookspath=[],
             runtime_hooks=[],
             excludes=[],
             win_no_prefer_redirects=False,
             win_private_assemblies=False,
             cipher=block_cipher,
             noarchive=False)
pyz = PYZ(a.pure, a.zipped_data,
             cipher=block_cipher)
exe = EXE(pyz,
          a.scripts,
          [],
          exclude_binaries=True,
          name='cortado-backend',
          debug=False,
          bootloader_ignore_signals=False,
          strip=False,
          upx=True,
          console=True)
coll = COLLECT(exe,
               a.binaries,
               a.zipfiles,
               a.datas,
               strip=False,
               upx=True,
               upx_exclude=[],
               name='cortado-backend')
