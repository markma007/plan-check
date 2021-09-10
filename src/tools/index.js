
let $store;

const onPlanDataLoaded = (planPath, RcData, MqData, Plan) => {
  $store.dispatch('qcl/add_new_plan', {planPath, RcData, MqData, Plan})
}

export default (store) => {
  $store = store
  window.electron.ListenToPlanLoaded(onPlanDataLoaded)
}

