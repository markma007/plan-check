<template>
  <q-btn @click="doReset()">Reset Current to NULL</q-btn>
</template>

<script>
import { defineComponent } from 'vue'
import { useStore } from 'vuex'

export default defineComponent({
  name: 'ResetButton',
  setup(props) {
    const $store = useStore()

    function doReset (event) {
      let key = '####NULL####'
      $store.dispatch('qcl/reset_current_task', key)
    }
    return {
      doReset
    }
  }
})
</script>
