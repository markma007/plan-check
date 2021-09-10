const fs = require('fs');

const trim_n_split = (line) => {
    if (line[0]==='"') line=line.substr(1,line.length-1)
    if (line[line.length-1]==='"') line=line.substr(0,line.length-1)
    return line.split("\",\"")
}

class RCPlanMeta {
    constructor (info) {
        this.MRN = info[1].trim()
        this.PtLastName = info[2].trim()
        this.PtFirstName = info[3].trim()
        this.PtMiddleName = ""
        this.RCVersion = info[24].trim()
    }
}

class RCPrescription {
    constructor (info) {
        this.CourseId = parseInt(info[1].trim())
        this.RXSite = info[2].trim()
        this.Technique = info[3].trim()
        this.Modality = info[4].trim()
        this.DoseSpec = info[5].trim()
        this.RXDose = parseInt(info[7].trim())
        this.FXDose = parseInt(info[8].trim())
        this.NumberOfFX = this.RXDose / this.FXDose
        this._PlanName = info[9].trim()
        this.NumberOfField = parseInt(info[11].trim())
    }
    get PlanName () {
        return this.CourseId+this._PlanName
    }
}

class RCSiteSetup {
    constructor (info) {
        this.RXSite = info[1].trim()
        this.PatientPosition = info[2].trim()
        this.Machine = info[3].trim()
        this.IsoX = parseFloat(info[5].trim())
        this.IsoY = parseFloat(info[6].trim())
        this.IsoZ = parseFloat(info[7].trim())
        this.UID1 = info[8].trim()
        this.UID2 = info[9].trim()
    }
}

class RCField {
    constructor (info,plan) {
        this.plan=plan
        //
        this.Rx = info[1].trim()
        //
        this.FieldName=info[2].trim().toUpperCase()
        this.FieldID=info[3].trim().toUpperCase()
        this.ControlPoints = []
        this.MUFractions = []
        try {
            this.Dose=parseFloat(info[5].trim())
        } catch(err) {
            this.Dose=0
        }
        this.MU=parseInt(info[6].trim())
        this.MLC="Off"
        this.Type=info[9]
        this.Modality=info[10]
        if (this.Type === "kV Setup" || this.Type === "Unspecified") this.Modality="Xrays"
        this.Energy=parseInt(info[11].trim())
        this.Compensator=""
        this.Block=""
        this.Bolus=""
        this.SSD = parseFloat(info[15].trim())
        this.GantryAngle=parseFloat(info[16].trim())
        this.CollimatorAngle=parseFloat(info[17].trim())
        this.JawXType=info[18]
        this.JawXWidth=parseFloat(info[19])
        this.JawX1=parseFloat(info[20].trim())
        this.JawX2=parseFloat(info[21].trim())
        this.JawYType=info[22]
        this.JawYWidth=parseFloat(info[23])
        this.JawY1=parseFloat(info[24].trim())
        this.JawY2=parseFloat(info[25].trim())
        this.CouchAngle=parseFloat(info[29].trim())
    }
    addCP (cp) {
        this.ControlPoints.push(cp)
    }
}

class RCControlPoint {
    constructor (info,field) {
        this.field=field
        this.field.CPNumber=parseInt(info[4])
        this.CPNumber=parseInt(info[5])
        let mufx = parseFloat(info[7])
        if (this.CPNumber>0) {
            this.MUFraction=mufx-this.field.MUFractions[this.CPNumber-1]
        } else {
            this.MUFraction=mufx
        }
        if (this.field.CPNumber>0) {
            this.field.MLC="On"
            this.field.MUFractions.push(parseFloat(info[7]))
        } else {
            this.field.MLC="Off"
            this.field.MUFractions.push(1.00)
        }
        this.NumberLeafPair=parseInt(info[3])
        this.JawXType=info[17]
        this.JawXWidth=parseFloat(info[18])
        this.JawX1=parseFloat(info[19])
        this.JawX2=parseFloat(info[20])
        this.JawYType=info[21]
        this.JawYWidth=parseFloat(info[22])
        this.JawY1=parseFloat(info[23])
        this.JawY2=parseFloat(info[24])
        this.leafPoints = []
        let J=32
        let X1S=[], X2S=[]
        while (info[J].trim()!=="") {
            X2S.push(parseFloat(info[J].trim()))
            J+=1
        }
        while (info[J].trim()==="") J+=1
        while (info[J].trim()!=="") {
            X1S.push(parseFloat(info[J].trim()))
            J+=1
        }
        X1S.forEach((x1,idx)=> {
            let x2=X2S[idx]
            this.leafPoints.push({x1, x2, i:idx})
        })
    }
}

class RCPlan {
    constructor (filename) {
        this.Type = 'class-rc-plan'
        this.Filename = filename
        this.Meta = null
        this.Prescriptions = []
        this.SiteSetups = []
        this.Fields = []
        this.CurrentField = null
    }
    read () {
        const data = fs.readFileSync(this.Filename, 'UTF-8')
        let Lines = data.split(/\r?\n/)
        Lines.forEach((line, index, lines) => {
            const aa = trim_n_split(line)
            ////////////////////////////////////////
            if (aa[0]=="PLAN_DEF") {
                this.Meta = new RCPlanMeta(aa)
            }
            ////////////////////////////////////////
            else if (aa[0]=="SITE_SETUP_DEF") {
                this.SiteSetups.push(new RCSiteSetup(aa))
            }
            ////////////////////////////////////////
            else if (aa[0]=="FIELD_DEF") {
                let fld = new RCField(aa,this)
                this.Fields.push(fld)
                this.CurrentField = fld
            }
            ////////////////////////////////////////
            else if (aa[0]=="CONTROL_PT_DEF") {
                if (parseInt(aa[3])) {
                    let cp = new RCControlPoint(aa,this.CurrentField)
                    this.CurrentField.addCP(cp)
                }
            }
            ////////////////////////////////////////
            else if (aa[0]=="RX_DEF") {
                let rx = new RCPrescription(aa)
                this.Prescriptions.push(rx)
            }
            ////////////////////////////////////////
            else {
                console.log('[ RC ]Not handled: ' + line);
            }
            ////////////////////////////////////////
        })
    }
    dump () {
        console.log(this)
    }
}

function ReadRadCalcExport (planPath) {
    let r = new RCPlan(planPath.RcFile)
    r.read()
    return r
}

module.exports = {
    ReadRadCalcExport
}
