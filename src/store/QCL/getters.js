
export function planInfo (state) {
    let PlanInfo = undefined
    if (state.current && state.current.Plan) {
        PlanInfo = state.current.Plan.PlanInfo
    }
    return PlanInfo
}

