<template>
  <router-view />
</template>
<script>
import { defineComponent } from 'vue'
import { useStore } from 'vuex'
import { useQuasar, Notify } from 'quasar'

import setUpElectrListener from './tools'

export default defineComponent({
  name: 'App',
  setup() {
    const $store = useStore()
    ////////////////////////
    setUpElectrListener($store)

    ////////////////////////
    // dark mode
    const $q = useQuasar()
    $q.dark.set(true)

    //
    return {}
  }
})
</script>
