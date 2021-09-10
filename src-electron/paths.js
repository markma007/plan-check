const { app } = require("electron");
const fs = require('fs');

// console.log('****************************')
// console.log(app.getAppPath())
// console.log(app.getPath('appData'))
// console.log(app.getPath('userData'))
// console.log(app.getName())
// console.log(app.getPath('home'))
// console.log(app.getPath('logs'))
// console.log(app.getPath('temp'))
// console.log(app.getPath('cache'))
// console.log(app.name)
// console.log('****************************')

const fixName = (p) => {
    // remove Electron
    return p.replaceAll('Electron', appName);
}

const appName = app.getName();
const appPath  = fixName( app.getPath('appData') );
const userPath = fixName( app.getPath('userData') );
const logsPath = fixName( app.getPath('logs') );

const paths = {
    logs: logsPath,
    appdata: appPath,
    userdata: userPath
}

module.exports = paths;