<template>
  <div style="border:0px solid yellow;">
      <div class="q-ma-md">
        Plan information
      </div>
      <div class="q-ma-md q-gutter-sm">
          <div>
              Patient: <span>{{planinfo.LastName}}, {{planinfo.FirstName}}</span>
          </div>
          <div>
              CC# {{planinfo.MedicalRecordNumber}}
          </div>
          <div>
              Plan: {{planinfo.PlanName}}
          </div>
          <div>
              Physician: {{planinfo.Physician}}
          </div>
          <div>
              Planner: {{planinfo.Planner}}
          </div>
          <q-space dir="vertical"></q-space>
          <br>
          <shifts-popup />
          <POIListPopup />
          <br>
          <q-btn color="deep-orange" label="Start Check" @click="showAlert"/>
      </div>
  </div>
</template>

<script>
import { defineComponent, ref, watch } from 'vue'
import { useStore } from 'vuex'
import { useQuasar } from 'quasar'

import ShiftsPopup from './ShiftPopup.vue'
import POIListPopup from 'src/components/POIListPopup.vue'

export default defineComponent({
  name: 'PlanInfoPanel',
  components: {
    ShiftsPopup, POIListPopup
  },
  setup() {
      const $q =useQuasar()
      const $store = useStore()
      let current = $store.state.qcl.current
      let inactive = ref(current===null)
      const defaultVal = {
          LastName: 'Last',
          FirstName: 'First',
          PatientName: 'First, Last',
          MedicalRecordNumber: '04-20-xxxx',
          PlanName: 'nXXXX',
          Planner: 'Planer',
          Physician: 'Physician'
      }
      let planinfo = ref(defaultVal)
      if (current) {
          planinfo.value = current.Plan.PlanInfo
      }

      watch(
        () => $store.state.qcl.current,
        (newVal, _) => {
          inactive.value = newVal === null
          planinfo.value = newVal ? newVal.Plan.PlanInfo : defaultVal
      })

      function showAlert () {
          $q.dialog({
              title: 'Prompt',
              message: 'What is your name?',
              prompt: {
                  model: '',
                  type: 'text'
              },
              cancel: true,
              persistent: true
          }).onOk((data)=>{
              console.log('ok', data);
          }).onCancel(()=>{
              console.log('cancel');
          }).onDismiss(()=>{
              console.log('... dismiss');
          })
      }

      return {
          planinfo,
          inactive,
          showAlert
      }
  }
})
</script>
