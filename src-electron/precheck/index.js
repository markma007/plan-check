const {
    ReadALLMisc,
    P3Laser, P3LaserCenter, 
    P3Poi, 
    P3PtSetup,
    P3PlanInfo,
    P3PlanRev
} = require('./PinnMisc')

const { PinnaclePlan } = require('./P3Plan')
const { PlanPath } = require('./PlanPath')

// const { P3roi, ReadRoi } = require('./RoiReader')
const { P3Trial, ReadTrial } = require('./TrialReader')

const { ReadRadCalcExport } = require('./RCReader')
const { ReadMosaiqExport } = require('./MQReader')

const { PreChecker } = require('./PreChecker')

function ReadPinnacalPlan (Paths) {
    /**
     * Read the plan Trials
     */
    ReadTrial(Paths)
    /**
     * Read various plan information, like
     * - POI, 
     * - Laser, LserCenter
     * - PtSetup, 
     * - PlanRev, 
     * - PlanInfo
     */
    ReadALLMisc(Paths)
    /**
     * Read the plan ROIs
     */
    // ReadRoi(Paths)
    /**
     * Make a final plan object
     */
    let plan = new PinnaclePlan({
        Trials: P3Trial.instances,
        // ROIs: P3roi.instances,
        POIs: P3Poi.instances,
        Laser: P3Laser.current,
        LaserCenter: P3LaserCenter.current,
        PtSetup: P3PtSetup.current,
        PlanInfo: P3PlanInfo.current,
        PlanRev: P3PlanRev.current
    })
    return plan
}

function CheckValidity(basePath) {

}

module.exports = {
    ReadPinnacalPlan,
    ReadRadCalcExport,
    ReadMosaiqExport,
    PreChecker,
    PlanPath,
    CheckValidity
}
