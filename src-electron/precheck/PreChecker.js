const fs = require('fs')

class SetupInstruction {
    constructor () {
        this.planName = ''
        this.implantedDevice = 'NO'
        this.isPregnant = 'NO'
        this.patientPosition = 'SUPINE'   // SUPINE | PRONE
        this.patientOrientation = 'HFS'   // HFS | FFS = Feet to gantry
        this.setupType = null  // 3 point setup | AP setup | midline setup
        this.isShifted = 'NO'
        this.bolus = 'NO'
        this.shifts = []
        this.TSDs = {
            // AP: '12cm'
            // RL
            // LL
        }
        this.ICTH = null
        this.TTH = null
        this.MedTT = ''
        this.LatTT = ''
        this.imageProtocol = null  // CBCT | portal image
        //
        // tattoos
        // vaclock
        // chin to SSN
        // pacemaker
        // etc
        //
    }
    parse (instruction) {
        let lines = instruction.split('\n')
        lines = lines.map( (line)=>line.trim() )
        lines = lines.filter( (line)=>line.length>0 )
        lines.forEach( this.parseLine, this )
    }
    parseLine (line, index, lines) {
        // console.log( index, lines.length, line )
        if (index===0) {
            this.planName = line
        }
        if (line.startsWith('Implanted') && line.indexOf('device')>0) {
            this.implantedDevice = line.split('device')[1].trim().toUpperCase()
        }
        if (line.startsWith('SHIFTS:')) {
            this.isShifted = line.split(':')[1].trim().toUpperCase()
        }
        if (line.startsWith('BOLUS:')) {
            this.bolus = line.split(':')[1].trim()
        }
        if (line.startsWith('Imaging Protocol:')) {
            this.imageProtocol = line.split(':')[1].trim()
        }
        if (line.startsWith('Setup on')) {
            this.setupType = line.split('on')[1].trim()
        }
        if (line.startsWith('ICTH=')) {
            this.ICTH = line.split('=')[1].trim()
        }
        if (line.toUpperCase() in ['SUPINE', 'PRONE']) {
            this.patientPosition = line
        }
        if (line.indexOf('FEET TO GANTRY')>=0) {
            this.patientOrientation = 'FFS'
        }
        if (line.indexOf('AP=')>-1 || line.indexOf('RL=')>-1 || line.indexOf('LL=')>-1) {
            let [key, value] = line.split('=')
            key = key.trim()
            value = value.trim()
            this.TSDs[key] = value
        }
    }
}

class PreChecker {
    constructor (configuration) {
        this.__config = configuration
        this.techniques = JSON.parse( fs.readFileSync(this.__config.technique) )
        this.modalities = JSON.parse( fs.readFileSync(this.__config.modality) )
        this.dosespecs = JSON.parse( fs.readFileSync(this.__config.dosespec) )
        this.instruction = new SetupInstruction()
    }
    dumpSetupInstruction () {
        console.log(this.instruction)
    }
    parseSetupInstruction (instruction) {
        this.instruction.parse(instruction)
    }
    /**
     * 
     * @param {*} MqExportedData 
     */
    checkMqPrescription (MqExportedData) {
        const rxs = MqExportedData.Prescriptions
        const makeResult = (msg) => msg ? {status: 'fail', reason: msg} : {status: 'pass'}
        let results = rxs.map( (rx)=>{
            // Technique Checks
            if (rx.Technique.trim()==='') { return makeResult('Technique unspecified') }
            if (this.techniques.filter((tech)=>tech.name===rx.Technique).length<1) {
                return makeResult('Invalid Technique: ' + rx.Technique)
            }
            if (this.techniques.filter((tech)=>tech.name===rx.Technique)[0].shouldUse===false) {
                return makeResult('Inactive Technique: ' + rx.Technique)
            }
            // Modality Checks
            if (rx.Modality.trim()==='') { return makeResult('Modality unspecified') }
            if (this.modalities.filter((tech)=>tech.name===rx.Modality).length<1) {
                return makeResult('Invalid Modality: ' + rx.Modality)
            }
            if (this.modalities.filter((tech)=>tech.name===rx.Modality)[0].shouldUse===false) {
                return makeResult('Inactive Modality: ' + rx.Modality)
            }
            // Dose Spec Checks
            if (rx.DoseSpec.trim()==='') { return makeResult('Dose Specification unspecified') }
            if (this.dosespecs.filter((tech)=>tech.name===rx.DoseSpec).length<1) {
                return makeResult('Invalid DoseSpec: ' + rx.DoseSpec)
            }
            if (this.dosespecs.filter((tech)=>tech.name===rx.DoseSpec)[0].shouldUse===false) {
                return makeResult('Inactive DoseSpec: ' + rx.DoseSpec)
            }
            // Dose Fractionation
            // TODO:

            // Okay ==> PASS
            return makeResult()
        } )
        return results
    }
    /**
     * 
     * @param {object} MqExport : data parsed from the MQ-exported file
     * @param {object} RcExport : data parsed from the MQ-exported file
     * @param {object} P3Data : Pinnacle data tp compared against Mq
     */
    verifyTransfer (MqExport, RcExport, P3Data) {
        //
        // console.log(MqExported)
        // console.log(P3Data.PtSetup)
    }

}

// let mq = new Mosaiq(conf)
// console.log(mq.techniques)
// console.log(mq.modalities)
// console.log(mq.dosespecs)
// let text = fs.readFileSync('./_MqSetupInstruction.txt',{encoding: 'utf8'})
// mq.parseSetupInstruction(text)
// mq.verify(null, null)

module.exports = {
    PreChecker
}