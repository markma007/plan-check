const {app, dialog} = require("electron");
const fs = require('fs');
// app.setName('Qcl') // keep this before require('./paths')
const paths = require('./paths');
// const path = require('path');

const {
    ReadPinnacalPlan,
    ReadRadCalcExport,
    ReadMosaiqExport,
    // PreChecker,
    PlanPath,
    CheckValidity
} = require('./precheck')

/////////////////////////////////////////////////////////////////////////
// handle the template-xxxxxx.json files

const readTemplateFile = (fn, notifyTemplateLoaded) => {
    const filename = paths.userdata + '\\templates\\' + fn;
    const data = JSON.parse(fs.readFileSync(filename));
    notifyTemplateLoaded(data);
}

const saveTemplateFile = (fn, content) => {
    const filename = paths.userdata + '\\templates\\' + fn;
    const data = JSON.stringify(content);
    fs.writeFileSync(filename, data)
}

const copyTemplateFile = (fn1, fn2) => { // copy 1 to 2
    const filename1 = paths.userdata + '\\templates\\' + fn1
    const filename2 = paths.userdata + '\\templates\\' + fn2
    fs.copyFileSync(filename1, filename2);
}

const deleteTemplateFile = (fn) => {
    const filename = paths.userdata + '\\templates\\' + fn
    fs.unlinkSync(filename)
}

/////////////////////////////////////////////////////////////////////////
// handle the index.json file

const readTemplateIndex = (notifyIndexLoaded) => {
    const filename = paths.userdata + '\\index.json'
    const data = JSON.parse(fs.readFileSync(filename))
    notifyIndexLoaded(data)
}

const saveTemplateIndex = (content) => {
    const filename = paths.userdata + '\\index.json'
    const data = JSON.stringify(content,null,2)
    fs.writeFileSync(filename, data)
}

/////////////////////////////////////////////////////////////////////////

const openCheckFile = (notify) => {
    const files = dialog.showOpenDialog({
        properties: ['openFile'],
        filters: [
            {name: 'JSON File', extensions:['json']}
        ]
      })
    if (!files) { return }
    files.then(({canceled, filePaths}) => {
        if (canceled || !filePaths) { return }
        let filePath = filePaths[0];
        const content = fs.readFileSync(filePath).toString();
        const checkDoc = JSON.parse(content);   // what if fails to parse ???
        // console.log(checkDoc)
        notify(checkDoc)
    })
}

/////////////////////////////////////////////////////////////////////////

const naviPlanFolder = (notify) => {
    const promise = dialog.showOpenDialog({
        properties: ['openDirectory']
      })
    // console.log(promise)
    if (!promise) { return }
    promise.then(({canceled, filePaths}) => {
        // console.log(canceled, filePaths)
        if (canceled || !filePaths) { return }
        let planBase = filePaths[0]
        let planPath = PlanPath(planBase)
        planPath.RcFileExist = fs.existsSync(planPath.RcFile)
        planPath.MqFileExist = fs.existsSync(planPath.MqFile)
        planPath.TrFileExist = fs.existsSync(planPath.Trial)
        // console.log(planPath)
        let RcData
        if (planPath.RcFileExist) {
            RcData = ReadRadCalcExport(planPath)
        }
        let MqData
        if (planPath.MqFileExist) {
            MqData = ReadMosaiqExport(planPath)
        }
        let Plan
        if (planPath.TrFileExist) {
            Plan = ReadPinnacalPlan(planPath)
        }
        if (notify) { notify({
            planPath,
            RcData,
            MqData,
            Plan
        }) }
    })
}


/////////////////////////////////////////////////////////////////////////

const saveCheckAsFile = (fileContent) => {
    const text = JSON.stringify(fileContent,null,2);
    const options = {
        defaultPath: app.getPath('documents') + '/data/test.json',
    }
    const pro = dialog.showSaveDialog(null, options);
    pro.then(({canceled, filePath})=>{
        if (canceled) return;
        fs.writeFileSync(filePath,text);
    })
}

module.exports = {
    ToolsOpenCheckFile: openCheckFile,
    ToolsSaveCheckAsFile: saveCheckAsFile,
    ToolsReadTemplateIndex: readTemplateIndex,
    ToolsSaveTemplateIndex: saveTemplateIndex,
    ToolsReadTemplateFile: readTemplateFile,
    ToolsSaveTemplateFile: saveTemplateFile,
    ToolsCopyTemplateFile: copyTemplateFile,
    ToolsDeleteTemplateFile: deleteTemplateFile,
    //
    ToolsNaviPlanFolder: naviPlanFolder
};