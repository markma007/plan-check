function MRN (planData) {
    let MedicalRecordNumber = undefined
    if (planData.Plan) {
        MedicalRecordNumber = planData.Plan.PlanInfo.MedicalRecordNumber
    }
    return MedicalRecordNumber
}

function GetPlanName (planData) {
    let PlanName = undefined
    if (planData.Plan) {
        PlanName = planData.Plan.PlanInfo.PlanName
    }
    return PlanName
}

export function addPlan (qclState, planData) {
    let mrn = MRN(planData)
    let pn = GetPlanName(planData)
    if (mrn && pn) {
        let key = mrn + '-' + pn
        planData['mrn'] = mrn
        planData['planName'] = pn
        planData['setupNote'] = ''
        qclState.tasks[key] = planData
        qclState.current = planData
    }
}

export function resetTaskByKey (qclState, key) {
    qclState.current = qclState.tasks[key]
    console.log(qclState.current);
}

export function updateSetupNote (qclState, note) {
    qclState.current.setupNote = note
}