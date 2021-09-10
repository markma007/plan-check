<template>
  <q-page class="q-pa-md fit items-stretch">
    
      <div class="fit row items-stretch">
        <div class="col-9">
          <setup-note />
        </div>
        <div class="col-3">
          <plan-info-panel />
        </div>
      </div>
  </q-page>
</template>

<script>
import { defineComponent, ref } from 'vue';
import { useStore } from 'vuex'
import PlanInfoPanel from '../components/PlanInfoPanel'
import SetupNote from '../components/SetupNote.vue'

export default defineComponent({
  name: 'PageIndex',
  components: {
    PlanInfoPanel,
    SetupNote
  },
  setup() {
    const $store = useStore()

    function OpenPlanFolder () {
      window.electron.OpenPlanFolder()
    }

    return {
      OpenPlanFolder
    }
  }
})
</script>


<style scoped>
  .local-bg {
      background: rgb(16, 3, 133);
  }
</style>