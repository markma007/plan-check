export function add_new_plan ({commit, dispatch, getters}, planData) {
    commit('addPlan', planData)
}

export function reset_current_task ({commit, dispatch, getters}, key) {
    commit('resetTaskByKey', key)
    console.log('current reset to:', key);
}

export function update_setup_note ({commit, dispatch, getters}, note) {
    commit('updateSetupNote', note)
}
