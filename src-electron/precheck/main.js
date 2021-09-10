const fs = require('fs')

const {
    ReadPinnacalPlan,
    ReadRadCalcExport,
    ReadMosaiqExport,
    PreChecker,
    PlanPath
} = require('./index')

let exportPath = 'D:/P3Data/'
///////////////////////////////////
let patientId = '83410_exported'
let planId = '0'
let imageSetId = '0'
///////////////////////////////////
// let patientId = '82184_exported'
// let planId = '0'
// let imageSetId = '0'

const Paths = PlanPath(exportPath, patientId, planId, imageSetId)

const localConf = {
    technique: "./data/WFCC_Technique.json",
    modality: "./data/WFCC_Modality.json",
    dosespec: "./data/WFCC_DoseSpec.json"
}
let plan = ReadPinnacalPlan(Paths)
let RCData = ReadRadCalcExport(Paths)
let MQData = ReadMosaiqExport(Paths, localConf)

let pc = new PreChecker(localConf)
let result

// step 1 - todo: generate a log file
result = pc.checkMqPrescription(MQData)
console.log(result)

// step 2 - todo: generate a log file
pc.parseSetupInstruction(
    fs.readFileSync('./_MqSetupInstruction.txt', {encoding: 'utf8'})
)
// pc.dumpSetupInstruction()

// step 3 - todo: generate a log file
result = pc.verifyTransfer(MQData, RCData, plan)


// step 4 - prepare input for go-check


// step 5 - start go-check and wait for result
//      5.1 - read license
//      5.2 - call external .exe

// step 6 - create PDF report
// let check = Check3DCRT(plan, RC, MQ)
// // MakePDF(check)