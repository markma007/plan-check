const fs = require('fs');
// const {createCanvas} = require('C:/Users/markma/AppData/Roaming/npm/node_modules/canvas')

const { P3Poi } = require('./PinnMisc')
// const { P3Couch } = require('./RoiReader')
// const { mergeBbox } = require('./P3ROIManager')

const key_value_line_parse = (line) => {
    let [name, value] = line.split("=")
    name=name.trim().replace(/\s/g,"_").replace(/\./g,"")
    try {
        value=value.replace(/"/g,"").replace(";","").trim()
    } catch {
        // console.log('==>', line)
    }
    
    return [name, value]
}

// const dot = (p, q) => {
//     return p.x*q.x + p.y*q.y + p.z*q.z
// }

const genCheckResult = (msg) => msg ? {status: 'fail', reason: msg} : {status: 'pass'}

class P3Trial {
    static current = null
    static instances = []
    constructor () {
        P3Trial.current = this
        P3Trial.instances.push(this)
        this.id=P3Trial.instances.length-1
        this.parent = -1
        this.parentType = undefined
        //
        // this.RemoveCouchFromScan = 1;
        // this.CouchRemovalYCoordinate = 1.37148;
        //
        this.RedGrid = null
        //
        this.Couch = null
    }
    digest (line, bracketDepth, Klass, topNode, lineNo, lines, NameStack, NodeStack) {
        if (bracketDepth==topNode.depth) {
            let [name, value] = key_value_line_parse(line)
            if (name==='CouchRemovalYCoordinate') value=parseFloat(value)
            if (name==='DoseGrid_Origin_X') value=parseFloat(value)
            if (name==='DoseGrid_Origin_Y') value=parseFloat(value)
            if (name==='DoseGrid_Origin_Z') value=parseFloat(value)
            if (name==='DoseGrid_VoxelSize_X') value=parseFloat(value)
            if (name==='DoseGrid_VoxelSize_Y') value=parseFloat(value)
            if (name==='DoseGrid_VoxelSize_Z') value=parseFloat(value)
            if (name==='DoseGrid_Dimension_X') value=parseFloat(value)
            if (name==='DoseGrid_Dimension_Y') value=parseFloat(value)
            if (name==='DoseGrid_Dimension_Z') value=parseFloat(value)
            this[name] = value
        }
    }
    setPlanObject (plan) {
        this.plan = plan
        this.Beams.forEach((beam)=>{
            beam.setPlanAndTrialObject(this.plan, this)
        }, this)
    }
    get PatientRepresentation () {
        return P3PatientRepresentation.instances.filter((pr)=>pr.parent===this.id)[0]
    }
    get CouchRemovalLine () { return this.CouchRemovalYCoordinate }
    get Beams () {
        return P3Beam.instances.filter((beam)=>beam.parent===this.id)
    }
    get numberOfPrescription () {
        return P3Prescription.instances.filter((rx)=>rx.parent===this.id).length
    }
    get prescriptions () {
        return P3Prescription.instances.filter((rx)=>rx.parent===this.id)
    }
    get prescription () {
        return P3Prescription.instances.filter((rx)=>rx.parent===this.id)[0]
    }
    get doseGridParameters () {
        return {
            start: {
                x: this.DoseGrid_Origin_X,
                y: this.DoseGrid_Origin_Y,
                z: this.DoseGrid_Origin_Z
            },
            spacing: {
                x: this.DoseGrid_VoxelSize_X,
                y: this.DoseGrid_VoxelSize_Y,
                z: this.DoseGrid_VoxelSize_Z
            },
            dim: {
                x: this.DoseGrid_Dimension_X,
                y: this.DoseGrid_Dimension_Y,
                z: this.DoseGrid_Dimension_Z
            }
        }
    }
    get UseCouchKick () {
        let r = false
        this.Beams.forEach((b)=>{
            r = r || b.Couch !== 0
        })
        return r
    }
    dump () {}
    dumpDetail () {}
    checkCT2DensityCurve () {
        if (['WFCC_June2015','WFCC_2015HighDensity'].indexOf(this.PatientRepresentation.CtToDensityName)===-1) {
            return genCheckResult('Wrong CT/Density curve: ' + this.PatientRepresentation.CtToDensityName)
        } else {
            return genCheckResult()
        }
    }
    checkPatientAirThreshold () {
        if (this.PatientRepresentation.OutsidePatientAirThreshold != 0.6) {
            return genCheckResult('Wrong Patient/Air threshold: ' + this.PatientRepresentation.OutsidePatientAirThreshold)
        } else {
            return genCheckResult()
        }
    }
    checkGridSpacing () {
        let str = this.DoseGrid_VoxelSize_X + ","
        str    += this.DoseGrid_VoxelSize_Y + ","
        str    += this.DoseGrid_VoxelSize_Z
        if (str !== '0.25,0.25,0.25') {
            return genCheckResult('Wrong dose grid spacing: ' + str)
        } else {
            return genCheckResult()
        }
    }
    checkDoseEngineType () {
        let msg = ""
        this.beams.forEach(
            (beam, index, beams)=> {
                if (beam.DoseEngine.TypeName!='Adaptive Convolve') { msg +=  ' [' + beam.Name + ': ' + beam.DoseEngine.TypeName + ']' }
            }
        )
        if (msg !== '') {
            return genCheckResult('Wrong dose calc type: ' + msg)
        } else {
            return genCheckResult()
        }
    }
    // PrepareCouch (ROIs) {
    //     let couchParts = ROIs.filter(roi=>roi.IsCouchPart)
    //     this.Couch = new P3Couch(couchParts)
    // }
}

class P3PatientRepresentation {
    static current = null
    static instances = []
    constructor () {
        P3PatientRepresentation.current = this
        P3PatientRepresentation.instances.push(this)
        this.id=P3PatientRepresentation.instances.length-1
        this.parent = P3Trial.current.id
        this.parentType = "P3Trial"
    }
    digest (line, bracketDepth, Klass, topNode, lineNo, lines, NameStack, NodeStack) {
        if (bracketDepth==topNode.depth) {
            let [name, value] = key_value_line_parse(line)
            this[name] = value
        }
    }
}

class P3Prescription {
    static current = null
    static instances = []
    constructor () {
        P3Prescription.current = this
        P3Prescription.instances.push(this)
        this.id=P3Prescription.instances.length-1
        this.parent = P3Trial.current.id
        this.parentType = "P3Trial"
        // this.Name = "5LUNL";
        // this.RequestedMonitorUnitsPerFraction = 612;
        // this.PrescriptionDose = 4800;
        // this.NumberOfFractions = 12;
        //
        // this.PrescriptionRoi = "PTV";
        // this.NormalizationMethod = "ROI Mean";
        // this.PrescriptionPoint = "SCNR_Rx";
        // this.NormalizationMethod = "Point Dose";
        //
        // this.PrescriptionPercent = 98.8;
        //
        ////// this.Method = "Prescribe";
        ////// this.PrescriptionPeriod = "Overall";
        ////// this.WeightsProportionalTo = "Monitor Units";
        ////// this.DoseUncertainty = 1;
        ////// this.PrescriptionUncertainty = 1;
        ////// this.DoseUncertaintyValid = 0;
        ////// this.PrescripUncertaintyValid = 0;
    }
    digest (line, bracketDepth, Klass, topNode, lineNo, lines, NameStack, NodeStack) {
        if (bracketDepth==topNode.depth) {
            let [name, value] = key_value_line_parse(line)
            this[name] = value
        }
    }
    get beams () {
        return P3Beam.instances.filter((beam)=>beam.PrescriptionName===this.Name)
    }
}

class P3Beam {
    static current = null
    static instances = []
    constructor () {
        P3Beam.current = this
        P3Beam.instances.push(this)
        this.id=P3Beam.instances.length-1
        this.parent = P3Trial.current.id
        this.parentType = "P3Trial"
        // this.Name
        // this.FieldID
        // this.IsocenterName
        // this.PrescriptionName
        // this.PrescriptionPointName
        // this.DoseRate
        // this.Weight
        // this.SSD
        // this.UseMLC
        // this.Modality
        // this.MachineEnergyName   // "6MV"
        // this.MachineNameAndVersion
        // this.SetBeamType
        // this.ActualLocalizerName // "Laser"
        //
        // this.Gantry
        // this.Couch
        // this.Collimator
        // this.MU                // <-- no use
        // this.ControlPoints
        // this.MonitorUnitInfo
        // this.DoseEngine
        // this.ODM               // <-- no use
        // this.Compensator       // <-- no use
        // this.Wedge             // <-- no use
        // this.Bolus             // <-- no use
        //
        // this.ControlPoints = []  => Getter
        //
        this.InfoISO = {
            SSD: 0,
            SAD: 100,
        }
        this.InfoREF = {
            RefName: '',
            RefCoord: [],
            SPD: 0,
            OAD: 0,
            SPDPerp: 0,     // SPD Perpendicular
            SSD: 0,         // SSD@POINT
            SSD_Perp: 0     // SSD Perpendicular
        }
    }
    digest (line, bracketDepth, Klass, topNode, lineNo, lines, NameStack, NodeStack) {
        if (bracketDepth==topNode.depth) {
            let [name, value] = key_value_line_parse(line)
            if (name==='SSD' || name==='Weight' || name==='DoseRate') value = parseFloat(value)
            this[name] = value
        }
    }
    setPlanAndTrialObject (plan, trial) {
        this.Plan = plan
        this.Trial = trial
    }
    get Gantry () { return this.ControlPoints[0].Gantry }
    get Couch () { return this.ControlPoints[0].Couch }
    get Collimator () { return this.ControlPoints[0].Collimator }
    /**
     * Get Beam Source coordinate w.r.t iso
     *   after Gantry/Couch rotation
     */
    // get SourcePoint () {
    //     let gantryAngle = - this.Gantry
    //     let couchAngle  = this.Couch  // Couch < 180
    //     if (this.Couch>180) {
    //         couchAngle = this.Couch - 360
    //     }
    //     couchAngle = - couchAngle // couch => equiv. linac head rotation
    //     gantryAngle = Math.PI * gantryAngle/180
    //     couchAngle  = Math.PI * couchAngle /180
    //     let xp = 0
    //     let yp = 100
    //     let zp = 0
    //     let x1 = xp*Math.cos(gantryAngle) - yp*Math.sin(gantryAngle)
    //     let y1 = xp*Math.sin(gantryAngle) + yp*Math.cos(gantryAngle)
    //     let z1 = zp
    //     let x = x1*Math.cos(couchAngle) + z1*Math.sin(couchAngle)
    //     let y = y1
    //     let z =-x1*Math.sin(couchAngle) + z1*Math.cos(couchAngle)
    //     x += this.ISO.x
    //     y += this.ISO.y
    //     z += this.ISO.z
    //     return {x, y, z}
    // }
    /**
     * Transform a patient point to a point w.r.t source
     *    without Gantry/Couch rotation
     * @param {Point} p = {x, y, z}
     */
    // Point2BEV (p) {
    //     let gantryAngle = - this.Gantry
    //     let couchAngle  = this.Couch  // Couch < 180
    //     if (this.Couch>180) {
    //         couchAngle = this.Couch - 360
    //     }
    //     couchAngle = - couchAngle // couch => equiv. linac head rotation
    //     gantryAngle = - Math.PI * gantryAngle/180
    //     couchAngle  = - Math.PI * couchAngle /180
    //     let xp = p.x - this.ISO.x
    //     let yp = p.y - this.ISO.y
    //     let zp = p.z - this.ISO.z
    //     let x1 = xp*Math.cos(couchAngle) + zp*Math.sin(couchAngle)
    //     let y1 = yp
    //     let z1= -xp*Math.sin(couchAngle) + zp*Math.cos(couchAngle)
    //     let x = x1*Math.cos(gantryAngle) - y1*Math.sin(gantryAngle)
    //     // y is of less interest
    //     // let y = x1*Math.sin(gantryAngle) + y1*Math.cos(gantryAngle)
    //     let z = z1
    //     return {x, y:z}
    // }
    get ISO () {
        let iso = P3Poi.GetPoiByName(this.IsocenterName)
        return {
            x: iso.XCoord, y: iso.YCoord, z: iso.ZCoord
        }
    }
    // get RxPOI () {
    //     let rx = P3Poi.GetPoiByName(this.PrescriptionPointName)
    //     return {
    //         x: rx.XCoord, y: rx.YCoord, z: rx.ZCoord
    //     }
    // }
    // get MU () { return }
    get ControlPoints () {
        let CPs = P3ControlPoint.instances.filter((cp)=>cp.parent===this.id)
        CPs.forEach((cp,index)=>{
            cp.index = index
            cp.beam = this
        }, this)
        return CPs
    }
    // ComputePOI (ref) {
    //     ref = ref || this.RxPOI
    //     let grid = this.Trial.RedGrid
    //     grid.StartTrace(this.SourcePoint, ref)
    // }
    // ComputeISO () {
    //     let ref = this.ISO
    //     let grid = this.Trial.RedGrid
    //     grid.StartTrace(this.SourcePoint, ref)
    // }
    // IntensityMap () {
    //     // pixel size is 1 mm ???
    // }
    // get MonitorUnitInfo () {
    //     return P3MonitorUnitInfo.instances.filter((mu)=>mu.parent===this.id)[0]
    // }
    // get DoseEngine () {
    //     return P3DoseEngine.instances.filter((de)=>de.parent===this.id)[0]
    // }
    // get ODM () {
    //     return P3ODM.instances.filter((odm)=>odm.parent===this.id)[0]
    // }
    // get ExposedUnblockeArea () {}
    // get Perimeter () {}
    // get EquivalentSquare () {}
    // get WeightedExposedBlockedArea () {
    //     let cps = this.ControlPoints
    //     let eba = 0
    //     cps.forEach((cp)=>{
    //         eba += cp.ExposedBlockedArea * cp.Weight
    //     })
    //     return eba
    // }
}

class P3ControlPoint {
    static current = null
    static instances = []
    constructor () {
        P3ControlPoint.current = this
        P3ControlPoint.instances.push(this)
        this.id=P3ControlPoint.instances.length-1
        this.parent = P3CPManager.current.id
        this.parentType = "P3CPManager"
        // P3Beam.ControlPoints.push(this)
        this.DoseGrid = null 
    }
    digest (line, bracketDepth, Klass, topNode, lineNo, lines, NameStack, NodeStack) {
        if (bracketDepth==topNode.depth) {
            // console.log('CP > ', line, NameStack[bracketDepth-1])
            let [name, value] = key_value_line_parse(line)
            if (name==='Gantry') value=parseFloat(value)
            if (name==='Couch') value=parseFloat(value)
            if (name==='Collimator') value=parseFloat(value)
            if (name==='LeftJawPosition') value=parseFloat(value)
            if (name==='RightJawPosition') value=parseFloat(value)
            if (name==='TopJawPosition') value=parseFloat(value)
            if (name==='BottomJawPosition') value=parseFloat(value)
            if (name==='DoseRate') value=parseFloat(value)
            if (name==='DeliveryTime') value=parseFloat(value)
            if (name==='Weight') value=parseFloat(value)
            this[name] = value
        }
    }
    // get numberOfPoints () {
    //     return P3RawData.instances[this.id].NumberOfPoints
    // }
    // get points () {
    //     return P3Points.instances[this.id].coords
    // }
    // mapping (p) {
    //     let canvasSize = 800
    //     let center = canvasSize / 2
    //     let scale = 20
    //     let coll = - this.Collimator / 180 * Math.PI
    //     let px = Math.cos(coll) * p.x - Math.sin(coll) * p.y
    //     let py = Math.sin(coll) * p.x + Math.cos(coll) * p.y
    //     let a = {x: 800-(center+px*scale), y: 800-(center+py*scale)}
    //     return a
    // }
    // mapping_roi (p) {
    //     let canvasSize = 800
    //     let center = canvasSize / 2
    //     let scale = 20
    //     let a = {x: center+p.x*scale, y: center+p.y*scale}
    //     return a
    // }
    // DrawBEV (PTV) {
    //     let canvasSize = 800
    //     const canvas = createCanvas(canvasSize, canvasSize)
    //     const ctx = canvas.getContext('2d')

    //     ctx.fillStyle = "#FFFFFF";
    //     ctx.fillRect(0, 0, canvasSize, canvasSize);

    //     ctx.fillStyle = "#FF0000";
    //     let qq = []
    //     PTV.curves.forEach((curve)=>{
    //         curve.points.XYs.forEach((p)=>{
    //             p.z = curve.z
    //             let q = this.beam.Point2BEV(p)
    //             let q1 = this.mapping_roi(q)
    //             // if (this.IsBlockingPoint(q)[0]) { q1.blocked=true }
    //             // console.log(q,)
    //             qq.push(q1)
    //         }, this)
    //     }, this)
    //     qq.forEach((q)=>{
    //         // if (q.blocked) {
    //             ctx.fillStyle = "#0000ff";
    //             ctx.strokeStyle = "#0000ff";
    //         // } else {
    //         //     ctx.fillStyle = "#FF0000";
    //         //     ctx.strokeStyle = "#FF0000";
    //         // }
    //         ctx.fillRect(q.x-1,q.y-1,3,3);
    //     })

    //     ctx.fillStyle = "#000000"
    //     ctx.lineWidth = 2

    //     // leaves
    //     ctx.beginPath();
    //     ctx.strokeStyle = "#000000"
    //     ctx.lineWidth = 1
    //     ctx.fillStyle = "#EEEEEE"
    //     this.points.forEach(
    //         (point) => {
    //             let pa = this.mapping({x: -20, y:point.y-0.25})
    //             let p1 = this.mapping({x:-point.x1, y:point.y-0.25})
    //             let p2 = this.mapping({x:-point.x1, y:point.y+0.25})
    //             let pb = this.mapping({x: -20, y:point.y+0.25})
    //             let pc = this.mapping({x:  20, y:point.y-0.25})
    //             let p3 = this.mapping({x: point.x2, y:point.y-0.25})
    //             let p4 = this.mapping({x: point.x2, y:point.y+0.25})
    //             let pd = this.mapping({x:  20, y:point.y+0.25})
    //             ctx.moveTo(pa.x, pa.y)
    //             ctx.lineTo(p1.x, p1.y)
    //             ctx.lineTo(p2.x, p2.y)
    //             ctx.lineTo(pb.x, pb.y)
    //             ctx.moveTo(pc.x, pc.y)
    //             ctx.lineTo(p3.x, p3.y)
    //             ctx.lineTo(p4.x, p4.y)
    //             ctx.lineTo(pd.x, pd.y)
    //         }
    //     )
    //     ctx.fill()
    //     ctx.stroke()
        
    //     // cross
    //     ctx.beginPath();
    //     ctx.strokeStyle = "#FF0000"
    //     ctx.lineWidth = 4
    //     let x1p = this.mapping({x:-20,y:0})
    //     let x2p = this.mapping({x: 20,y:0})
    //     let y1p = this.mapping({x:0,y:-20})
    //     let y2p = this.mapping({x:0,y: 20})
    //     ctx.moveTo(x1p.x, x1p.y)
    //     ctx.lineTo(x2p.x, x2p.y)
    //     ctx.moveTo(y1p.x, y1p.y)
    //     ctx.lineTo(y2p.x, y2p.y)
    //     ctx.stroke()

    //     ctx.beginPath();
    //     ctx.strokeStyle = "#0000FF"
    //     ctx.lineWidth = 2
    //     let pa = this.mapping({x: -this.LeftJawPosition, y: -this.TopJawPosition})
    //     let pb = this.mapping({x: this.RightJawPosition, y: -this.TopJawPosition})
    //     let pc = this.mapping({x: -this.LeftJawPosition, y: this.BottomJawPosition})
    //     let pd = this.mapping({x: this.RightJawPosition, y: this.BottomJawPosition})
    //     ctx.moveTo(pa.x, pa.y)
    //     ctx.lineTo(pb.x, pb.y)
    //     ctx.lineTo(pd.x, pd.y)
    //     ctx.lineTo(pc.x, pc.y)
    //     ctx.lineTo(pa.x, pa.y)
    //     ctx.stroke();

    //     // iso
    //     // ctx.fillCircle(center,center,10);

    //     // text
    //     ctx.fillStyle = "#FFFFFF";
    //     ctx.strokeStyle = "#000000";
    //     ctx.fillRect(100,10,600,50);
    //     ctx.fillStyle = "#000000";
    //     ctx.font = "20px Georgia";
    //     ctx.fillText(
    //         "Beam: "+this.beam.Name,
    //         120, 30
    //     );
    //     ctx.fillText(
    //         "Gantry: "+this.beam.Gantry+
    //         ", Couch: "+this.beam.Couch+
    //         ", Coll: "+this.Collimator,
    //         380, 30
    //     );
    //     ctx.fillText(
    //         "CP# "+(this.index+1),
    //         380, 50
    //     );

    //     let a = canvas.createPNGStream()
    //     const out = fs.createWriteStream('D:/P3Data/Tmp_BEV/BEV_'+this.Gantry+'_'+this.index+'.png')
    //     a.pipe(out)
    // }
    // IsBlockingPoint (p) {
    //     let {x, y} = p // this.beam.Point2BEV(p)
    //     let iy = Math.floor(y/0.5) + 40    // leaf width@iso, # of leaf / 2
    //     let {x1, x2} = this.points[iy]
    //     x1 = - x1
    //     // TODO: collimator rotation
    //     // console.log(x1, x2, x)
    //     if (x<x1) { return [true, 'LBank', iy] }
    //     else if (x>x2) { return [true, 'RBank', iy] }
    //     else { return [false, null, null] }
    // }
    // IsAtPenumbra (p) {
    //     let {x, y} = p // this.beam.Point2BEV(p)
    //     let iy = Math.floor(y/0.5) + 40    // leaf width@iso, # of leaf / 2
    //     let {x1, x2} = this.points[iy]
    //     x1 = - x1
    //     // TODO: collimator rotation
    //     // console.log(x1, x2, x)
    //     let penumbra = 0.2 // assuming penumbra is 0.2 from edge
    //     if (Math.abs(x-x1)<penumbra || Math.abs(x-x2)<penumbra) {
    //         return true
    //     } else {
    //         return false
    //     }
    // }
    // get NarrowestOpening () {
    //     let points = this.points
    //     let narrow = 100000
    //     points.forEach((p)=>{
    //         let a = p.x1+p.x2
    //         if (a>0.5 && a<narrow) narrow = a
    //     })
    //     return narrow
    // }
    // get WidestOpening () {
    //     let points = this.points
    //     let wide = 0.5
    //     points.forEach((p)=>{
    //         let a = p.x1+p.x2
    //         if (a>wide) wide = a
    //     })
    //     return wide
    // }
    // get AverageOpening () {
    //     let points = this.points
    //     let sum = 0
    //     let n = 0
    //     points.forEach((p)=>{
    //         let a = p.x1+p.x2
    //         if (a>0.5) { sum += a; n+=1}
    //     })
    //     return sum / n
    // }
    // get NumberOfOpening () {
    //     let points = this.points
    //     let n = 0
    //     points.forEach((p)=>{
    //         let a = p.x1+p.x2
    //         if (a>0.5) { n+=1}
    //     })
    //     return n
    // }
    // get OpenArea () {
    //     let L = this.LeftJawPosition + this.RightJawPosition
    //     let W = this.TopJawPosition + this.BottomJawPosition
    //     return L*W
    // }
    // get Perimeter () {
    //     let L = this.LeftJawPosition + this.RightJawPosition
    //     let W = this.TopJawPosition + this.BottomJawPosition
    //     return 2*(L+W)
    // }
    // get SegmentArea () {
    //     let points = this.points
    //     let area0 = 0
    //     points.forEach((p)=>{
    //         if (p.x1+p.x2>0.5) area0 += (p.x1+p.x2)/2 - 0.125/3
    //     })
    //     return area0
    // }
    // get BlockedArea () {
    //     return this.OpenArea - this.SegmentArea
    // }
    // get EQSQ_Iso () {
    //     let L = this.LeftJawPosition + this.RightJawPosition
    //     let W = this.TopJawPosition + this.BottomJawPosition
    //     return 2*L*W / (L+W)
    // }
    // get BlockedEQSQ_Iso () {
    //     return this.EQSQ_Iso * Math.sqrt(
    //         (this.OpenArea - this.BlockedArea) / this.OpenArea
    //     )
    // }
    // get BlockedEQSQ_Surf () {

    // }
    // get MU () {
        
    // }
}

class P3MLCLeafPositions {
    static current = null
    static instances = []
    constructor () {
        P3MLCLeafPositions.current = this
        P3MLCLeafPositions.instances.push(this)
        this.id=P3MLCLeafPositions.instances.length-1
        this.parent = P3ControlPoint.current.id
        this.parentType = "P3ControlPoint"
        P3ControlPoint.current.LeafPositions = this
    }
    digest (line, bracketDepth, Klass, topNode, lineNo, lines, NameStack, NodeStack) {}
}

class P3RawData {
    static current = null
    static instances = []
    constructor () {
        P3RawData.current = this
        P3RawData.instances.push(this)
        this.id=P3RawData.instances.length-1
        this.parent = P3MLCLeafPositions.current.id
        this.parentType = "P3MLCLeafPositions"
    }
    digest (line, bracketDepth, Klass, topNode, lineNo, lines, NameStack, NodeStack) {
        if (bracketDepth==topNode.depth) {
            let [name, value] = key_value_line_parse(line)
            value = parseInt(value)
            this[name] = value
        }
    }
}

class P3Points {
    static current = null
    static instances = []
    constructor () {
        P3Points.current = this
        P3Points.instances.push(this)
        this.id=P3Points.instances.length-1
        this.parent = P3RawData.current.id
        this.parentType = "P3RawData"
        this.coords=[]
        // P3ControlPoint.current.points = this
    }
    digest (line, bracketDepth, Klass, topNode, lineNo, lines, NameStack, NodeStack) {
        if (bracketDepth==topNode.depth) {
            let [x1,x2,dummy] = line.split(',')
            x1=parseFloat(x1)
            x2=parseFloat(x2)
            this.coords.push({x1,x2})
        }
    }
}

class P3LabelList {
    static current = null
    static instances = []
    constructor () {
        P3LabelList.current = this
        P3LabelList.instances.push(this)
        this.id=P3LabelList.instances.length-1
        // this.parent = P3MLCLeafPositions.current.id
        this.parentType = "P3MLCLeafPositions"
    }
    digest (line, bracketDepth, Klass, topNode, lineNo, lines, NameStack, NodeStack) {}
}

class P3RowLabelList {
    static current = null
    static instances = []
    constructor () {
        P3RowLabelList.current = this
        P3RowLabelList.instances.push(this)
        this.id=P3RowLabelList.instances.length-1
        this.parent = P3MLCLeafPositions.current.id
        this.parentType = "P3MLCLeafPositions"
    }
    digest (line, bracketDepth, Klass, topNode, lineNo, lines, NameStack, NodeStack) {
        line=line.replace('  ',' ')
        let idx = line.split(' ')[3]
        idx = parseInt(idx.substring(0,idx.length-1)) - 1
        let Y = parseFloat(line.split(' ')[6])
        P3Points.current.coords[idx].y=Y
    }
}

class P3LabelFormatList {
    static current = null
    static instances = []
    constructor () {
        P3LabelFormatList.current = this
        P3LabelFormatList.instances.push(this)
        this.id=P3LabelFormatList.instances.length-1
        // this.parent = P3MLCLeafPositions.current.id
        this.parentType = "P3MLCLeafPositions"
    }
    digest (line, bracketDepth, Klass, topNode, lineNo, lines, NameStack, NodeStack) {}
}



class P3DoseEngine {
    static current = null
    static instances = []
    constructor () {
        P3DoseEngine.current = this
        P3DoseEngine.instances.push(this)
        this.id=P3DoseEngine.instances.length-1
        this.parent = P3Beam.current.id
        this.parentType = "P3Beam"
        P3Beam.current.DoseEngine = this
    }
    digest (line, bracketDepth, Klass, topNode, lineNo, lines, NameStack, NodeStack) {
        if (bracketDepth==topNode.depth) {
            let [name, value] = key_value_line_parse(line)
            this[name] = value
        }
    }
}

class P3MonitorUnitInfo {
    static current = null
    static instances = []
    constructor () {
        P3MonitorUnitInfo.current = this
        P3MonitorUnitInfo.instances.push(this)
        this.id=P3MonitorUnitInfo.instances.length-1
        this.parent = P3Beam.current.id
        this.parentType = "P3Beam"
        P3Beam.current.MonitorUnitInfo = this
    }
    digest (line, bracketDepth, Klass, topNode, lineNo, lines, NameStack, NodeStack) {
        if (bracketDepth==topNode.depth) {
            let [name, value] = key_value_line_parse(line)
            if (name!=='OutputFactorInfo')
                value = parseFloat(value)
            this[name] = value
        }
    }
}

class P3Compensator {
    static current = null
    static instances = []
    constructor () {
        P3Compensator.current = this
        P3Compensator.instances.push(this)
        this.id=P3Compensator.instances.length-1
        this.parent = P3Beam.current.id
        this.parentType = "P3Beam"
        P3Beam.current.Compensator = this
    }
    digest (line, bracketDepth, Klass, topNode, lineNo, lines, NameStack, NodeStack) {
        if (bracketDepth==topNode.depth) {
            let [name, value] = key_value_line_parse(line)
            this[name] = value
        }
    }
}

class P3Wedge {}

class P3Bolus {}

class P3ODM {
    static current = null
    static instances = []
    constructor () {
        P3ODM.current = this
        P3ODM.instances.push(this)
        this.id=P3ODM.instances.length-1
        this.parent = P3Beam.current.id
        this.parentType = "P3Beam"
        P3Beam.current.ODM = this
    }
    digest (line, bracketDepth, Klass, topNode, lineNo, lines, NameStack, NodeStack) {
        if (bracketDepth==topNode.depth) {
            let [name, value] = key_value_line_parse(line)
            this[name] = value
        }
    }
}

class P3CPManager {
    static current = null
    static instances = []
    constructor () {
        P3CPManager.current = this
        P3CPManager.instances.push(this)
        this.id=P3CPManager.instances.length-1
        this.parent = P3Beam.current.id
        this.parentType = "P3Beam"
    }
    digest (line, bracketDepth, Klass, topNode, lineNo, lines, NameStack, NodeStack) {
        if (bracketDepth==topNode.depth) {
            let [name, value] = key_value_line_parse(line)
            if (name==='NumberOfControlPoints') value=parseInt(value)
            this[name] = value
        }
    }
}

let HandledDict = {
    P3Trial, 
    P3PatientRepresentation, 
    P3Prescription, 
    P3Beam,
    P3CPManager,
    // P3CPManagerObject: P3CPManager,
    P3ControlPoint,
    P3MLCLeafPositions,
    P3RawData,
    P3Points,
    P3LabelList,
    P3RowLabelList,
    P3LabelFormatList,
    P3DoseEngine,
    P3MonitorUnitInfo,
    P3Compensator,
    P3ODM
}

class P3PlanReader {
    constructor (filename) {
        this.Type = 'class-p3-plan'
        this.Filename = filename
        this.Lines = null
    }
    read () {
        const data = fs.readFileSync(this.Filename, 'UTF-8')
        this.Lines = data.split(/\r?\n/)
        let NodeStack = []
        let NameStack = []
        let bracketDepth = 0
        this.Lines.forEach((line, index, lines) => {
            let __line=line.trim()
            if (__line==="") return
            /**
             * 
             */
            if (__line.endsWith("={")) {
                bracketDepth += 1
                let node = __line.split(" ")[0]
                if (node.startsWith('#')) {
                    let parentName = NameStack[NameStack.length-1]
                    // console.log(node, parentNodeName)
                    if (parentName==='ControlPointList') {
                        new P3ControlPoint()
                        // console.log('///////////')
                        NodeStack.push({node:'ControlPoint', depth:bracketDepth})
                    } else if (parentName==='RowLabelList') {
                        // console.log('**********')
                        // let leafPairId = parseInt(node.substring(1,node.length-1))
                    }
                } else if (node==='RawData') {
                    let parentName = NameStack[NameStack.length-1]
                    // console.log(parentName)
                    if (parentName==='MLCLeafPositions') {
                        new P3RawData()
                        NodeStack.push({node:'RawData', depth:bracketDepth})
                    }
                } else if (node==='Points[]') {
                    // console.log(__line)
                    let parentName = NameStack[NameStack.length-2]
                    if (parentName==='MLCLeafPositions') {
                        new P3Points()
                        NodeStack.push({node:'Points', depth:bracketDepth})
                    }
                } else if (node==='RowLabelList') {
                    let parentName = NameStack[NameStack.length-1]
                    // console.log(parentName)
                    if (parentName==='MLCLeafPositions') {
                        new P3RowLabelList()
                        NodeStack.push({node:'RowLabelList', depth:bracketDepth})
                    }
                } else {
                    let name = 'P3'+node
                    if (HandledDict.hasOwnProperty(name)) {
                        new HandledDict[name]()
                        NodeStack.push({node, depth:bracketDepth})
                    }
                }
                NameStack.push(node)
            }
            /**
             * 
             */
            else if (__line.endsWith("};")) {
                let topNode = NodeStack[NodeStack.length-1]
                if (bracketDepth===topNode.depth) {
                    NodeStack.pop()
                }
                NameStack.pop()
                bracketDepth -= 1
            }
            /**
             * 
             */
            else {
                let topNode = NodeStack[NodeStack.length-1]
                // console.log(topNode) // {node, depth}
                if (topNode) { // topNode is undefined for top-level lines
                    let Klass = HandledDict['P3' + topNode.node]
                    if (bracketDepth>=topNode.depth) {
                        Klass.current.digest(__line, bracketDepth, Klass, topNode, index, lines, NameStack, NodeStack)
                    }
                } else {
                    // console.log('Top level >', index, __line)
                }
                //if (NameStack.length!==bracketDepth)
                //    console.log(false)
                // console.log(index,bracketDepth-1,NameStack.join(":"))
            }
        })
    }
    dump () {
        let keys = Object.keys(HandledDict)
        // keys = ["P3CPManager", "P3ControlPointList"]
        // keys = []
        // keys.forEach(function (key, index) {
        //     let Klass = HandledDict[key]
        //     console.log(key, Klass.instances)
        // })
        console.log(P3Beam.current)
        console.log(P3ControlPoint.current)
        console.log(P3RawData.current)
        console.log(P3Points.current)
        console.log(P3RowLabelList.current)
        console.log(P3MonitorUnitInfo.current)
    }
}

function ReadTrial (Paths) {
    let r = new P3PlanReader(Paths.Trial)
    r.read()
    // r.dump()
}

module.exports = {
    P3Trial,
    ReadTrial
}

// let r = new P3PlanReader('Patient_83410/plan.Trial')
// // let r = new P3PlanReader('./plan_small.Trial')
// r.read()
// r.dump()


// console.log(P3Trial.instances.length)
// console.log(P3Trial.current.beams.length)

// console.log(P3Trial.current.beams[0].controlPoints.length)
// console.log(P3Trial.current.beams[1].controlPoints.length)
// console.log(P3Trial.current.beams[2].controlPoints.length)
// console.log(P3Trial.current.beams[3].controlPoints.length)

// console.log(P3ControlPoint.current.numberOfPoints)
// console.log(P3ControlPoint.current.points)

// console.log(P3Trial.current.prescriptions)
// console.log(P3Trial.current.prescriptions[0].beams.length)