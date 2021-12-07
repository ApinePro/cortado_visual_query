exports.default = () => {
    const fs = require('fs');
    const process = require('process');
    const path = require('path');
    let appBuildDir = 'app-dist';
    if(fs.existsSync(path.join(__dirname, '..', appBuildDir, 'win-unpacked'))){
        appOutDir = 'win-unpacked';
    } else { // linux build
        appOutDir = 'linux-unpacked';
    }
    fs.mkdirSync(path.join(__dirname, '..', appBuildDir, appOutDir, 'cortado-backend'))
}