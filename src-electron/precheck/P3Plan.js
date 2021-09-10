
const { PatientSetupType } = require('./utils/PatientSetupType')
const { PatientPositionType } = require('./utils/PatientPositionType')
// const { P3ROIManager } = require('./P3ROIManager')
const { P3Poi } = require('./PinnMisc')

class P3Plan {
    constructor ({Trials,
        ROIs, POIs,
        LaserCenter,
        PtSetup, PlanInfo, PlanRev
    }) {
        // ////////////////////
        this.Trials = Trials
        Trials.forEach((trial)=>{
            trial.setPlanObject(this)
        }, this)
        this.defaultTrial = this.Trials[0]
        this.currentTrial = this.defaultTrial
        // Pinnacle Objects //
        this.ROIs = ROIs
        this.POIs = POIs
        this.LaserCenter = LaserCenter
        this.PatientSetup = PtSetup
        this.PlanInfo = PlanInfo
        this.PlanRev = PlanRev
        // this.ROIManager = new P3ROIManager(ROIs)
        // ////////////////////
        // this.currentTrial.PrepareCouch(this.ROIs)
        // ////////////////////
        // this.BBs = this.BBSRoi.SortBBS()
        // this.Couch  <---- trial.Couch
        // this.Gas
        // Bolus
        // let setupType = this.determineSetupType() // <=== dont move this line
        // bbs
        ///////////////////////
    }
    /**
     * Current trial should be the Clinical trial
     */
    makeTrialCurrent (trialName) {
        let filtered = this.Trials.filter((tr)=>tr.Name===trialName)
        this.currentTrial = filtered.length===0 ? null : filtered[0]
    }
    /**
     * 
     */
    get PatientPosition () {
        return this.PatientSetup.PatientPosition
    }
    get PatientOrientation () {
        return this.PatientSetup.PatientOrientation
    }
    get PositionType () {
        return [
            this.PatientOrientation[1],
            this.PatientPosition[1]
        ].join('/')
    }
    // get PTV () {
    //     return this.ROIs.filter((roi)=>roi.name==='LT PTV')[0]
    // }
    // get BBSRoi () {
    //     let BBSRoi = null
    //     let filtered = this.ROIs.filter((roi)=>roi.IsBB)
    //     if (filtered.length>0) BBSRoi = filtered[0]
    //     return BBSRoi
    // }
    // determineSetupType () {
    //     let n = 
    //     this.BBs.filter((bb) => Math.abs(bb.z-this.SetupPoint.ZCoord)<0.3 ).length
    //     if (n===1) {
    //         return PatientSetupType.AP_SETUP
    //     } else if (n===2) {
    //         return PatientSetupType.MIDLINE_SETUP
    //     } else if (n===3) {
    //         return PatientSetupType.THREEPOINT_SETUP
    //     }
    //     return 'Unknown Setup'
    // }
    // get IsCouchUsed () {
    // }
    // get TableMotion () {
    //     return this.PatientSetup.TableMotion
    // }
    // get RxPOI () {
    //     let filtered = this.POIs.filter((poi)=>poi.Name==='Rx Point')
    //     return filtered.length>0 ? filtered[0] : null
    // }
    // get LaserPOI () { return this.LaserCenter }
    // get Laser () {
    //     return {
    //         x: this.LaserCenter.XCoord,
    //         y: this.LaserCenter.YCoord,
    //         z: this.LaserCenter.ZCoord
    //     }
    // }
    // get Revision () {
    //     return this.PlanRev.LockedRevision
    // }
    // get CouchTopY () {
    //     let Y = null
    //     let filtered = this.ROIs.filter((roi)=>roi.name==='1_CouchShell')
    //     if (filtered.length>0) Y = filtered[0].BBox.Ymax
    //     return Y
    // }
    // get ISO () { 
    //     let filtered = this.POIs.filter((poi)=>poi.IsISO)
    //     return filtered.length>0 ? filtered[0] : null
    // }
    get SetupPoint () {
        let filtered = this.POIs.filter((poi)=>poi.IsSetup)
        if (filtered.length===0) {
            filtered = this.POIs.filter((poi)=>poi.IsISO)
        }
        return filtered.length>0 ? filtered[0] : null
    }
    // get Shifts () {
    //     let IsoShifts = {}
    //     let xDiff = this.ISO.XCoord - this.SetupPoint.XCoord
    //     let yDiff = this.ISO.YCoord - this.SetupPoint.YCoord
    //     let zDiff = this.ISO.ZCoord - this.SetupPoint.ZCoord
    //     //////////////////////////////////////////////////////////////
    //     let positionType = this.positionType
    //     if (positionType === PatientPositionType.HFS) {
    //         //////////////////////////////////////////////////////////////
    //         // HF/S = supine + HFS
    //         if (xDiff < 0) {
    //             IsoShifts['RT'] = Math.abs(xDiff) // + 'cm'
    //         } else if (xDiff > 0) {
    //             IsoShifts['LT'] = Math.abs(xDiff) // + 'cm'
    //         }
    //         if (yDiff < 0) {
    //             IsoShifts['POST'] = Math.abs(yDiff) // + 'cm'
    //         } else if (yDiff > 0) {
    //             IsoShifts['ANT'] = Math.abs(yDiff) // + 'cm'
    //         }
    //         if (zDiff < 0) {
    //             IsoShifts['SUP'] = Math.abs(zDiff) // + 'cm'
    //         } else if (zDiff > 0) {
    //             IsoShifts['INF'] = Math.abs(zDiff) // + 'cm'
    //         }
    //     } else if (positionType === PatientPositionType.FFS) {
    //         //////////////////////////////////////////////////////////////
    //         // FF/S = supine + FFS
    //         if (xDiff < 0) {
    //             IsoShifts['LT'] = Math.abs(xDiff) // + 'cm'
    //         } else if (xDiff > 0) {
    //             IsoShifts['RT'] = Math.abs(xDiff) // + 'cm'
    //         }
    //         if (yDiff < 0) {
    //             IsoShifts['POST'] = Math.abs(yDiff) // + 'cm'
    //         } else if (yDiff > 0) {
    //             IsoShifts['ANT'] = Math.abs(yDiff) // + 'cm'
    //         }
    //         if (zDiff < 0) {
    //             IsoShifts['INF'] = Math.abs(zDiff) // + 'cm'
    //         } else if (zDiff > 0) {
    //             IsoShifts['SUP'] = Math.abs(zDiff) // + 'cm'
    //         }
    //     } else if (positionType === PatientPositionType.HFP) {
    //         //////////////////////////////////////////////////////////////
    //         // HF/P = prone + HFS
    //         if (xDiff < 0) {
    //             IsoShifts['LT'] = Math.abs(xDiff) // + 'cm'
    //         } else if (xDiff > 0) {
    //             IsoShifts['RT'] = Math.abs(xDiff) // + 'cm'
    //         }
    //         if (yDiff < 0) {
    //             IsoShifts['ANT'] = Math.abs(yDiff) // + 'cm'
    //         } else if (yDiff > 0) {
    //             IsoShifts['POST'] = Math.abs(yDiff) // + 'cm'
    //         }
    //         if (zDiff < 0) {
    //             IsoShifts['SUP'] = Math.abs(zDiff) // + 'cm'
    //         } else if (zDiff > 0) {
    //             IsoShifts['INF'] = Math.abs(zDiff) // + 'cm'
    //         }
    //     } else if (positionType === PatientPositionType.FFP) {
    //         //////////////////////////////////////////////////////////////
    //         // FF/P = prone + FFS
    //         if (xDiff < 0) {
    //             IsoShifts['RT'] = Math.abs(xDiff) // + 'cm'
    //         } else if (xDiff > 0) {
    //             IsoShifts['LT'] = Math.abs(xDiff) // + 'cm'
    //         }
    //         if (yDiff < 0) {
    //             IsoShifts['ANT'] = Math.abs(yDiff) // + 'cm'
    //         } else if (yDiff > 0) {
    //             IsoShifts['POST'] = Math.abs(yDiff) // + 'cm'
    //         }
    //         if (zDiff < 0) {
    //             IsoShifts['INF'] = Math.abs(zDiff) // + 'cm'
    //         } else if (zDiff > 0) {
    //             IsoShifts['SUP'] = Math.abs(zDiff) // + 'cm'
    //         }
    //     } else {
    //         // wrong positionType
    //     }
    //     //////////////////////////////////////////////////////////////
    //     return IsoShifts
    // }
    // checkPOIType () {
    // }
    // get ICTH () {
    //     return this.ISO.YCoord - this.CouchTopY
    // }
    // get TTH () {}
    /**
     * Compute TSD for point along certain direction specified
     * @param {String | Object} Point - the point for which TSD is computed
     * @param {String} direction - must be 'AP' | 'RL' | 'LL' 
     */
    // ComputeTSD (Point, direction) {
    //     let p = null
    //     if (typeof Point === 'string') {
    //         // Point = POI name
    //         let poi = P3Poi.GetPoiByName(Point)
    //         p = {x: poi.XCoord, y: poi.YCoord, z: poi.ZCoord}
    //     } else if (Point instanceof Object) {
    //         p = Point // Point = {x, y, z}
    //     } else {
    //         // wrong point
    //     }
    //     let Src = {}
    //     if (direction === 'AP') {
    //         Src = {x:p.x, y:p.y+100, z:p.z}
    //     } else if (direction === 'RL') {
    //         Src = {x:p.x-100, y:p.y, z:p.z}
    //     } else if (direction === 'LL') {
    //         Src = {x:p.x+100, y:p.y, z:p.z}
    //     }
    //     this.currentTrial.RedGrid.StartTrace(Src, p)
    // }
    // get CT2DensityNames () {
    //     return this.Trials.map(
    //         (trial) => trial.PatientRepresentation.CtToDensityName
    //     )
    // }
    // get PatientAirThresholds () {
    //     return this.Trials.map(
    //         (trial) => trial.PatientRepresentation.OutsidePatientAirThreshold
    //     )
    // }
}


module.exports = {
    PinnaclePlan: P3Plan
}