
const PlanPath = (planBase) => {
    return {
        PlanBase: planBase,
        ///////////////////////////////////////////////////////
        Trial: planBase + '/plan.Trial',
        Roi: planBase + '/plan.roi',
        Laser: planBase + '/plan.Laser',
        PlanInfo: planBase + '/plan.PlanInfo',
        PlanRev: planBase + '/plan.PlanRev',
        Points: planBase + '/plan.Points',
        PatientSetup: planBase + '/plan.PatientSetup',
        VolumeInfo: planBase + '/plan.VolumeInfo',
        //
        MqFile: planBase + '/2Mos.RTP',
        RcFile: planBase + '/3Rad.RTP',
        //
        ImageHeader: planBase + '/ImageSet_0.header',
        ImageData: planBase + '/ImageSet_0',
    }
    
}

module.exports = {
    PlanPath
}