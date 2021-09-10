<template>
  <div style="border:0px solid yellow;">
      <div class="q-ma-md">
        Plan information
      </div>
      <div v-if="inactive">
          Empty
      </div>
      <div v-if="!inactive" class="q-ma-md">
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
          <q-space></q-space>
          <br>
          <q-btn label="Points of Interest"/>
          <br>
          <q-btn color="deep-orange" @click="showAlert" style="display:block;">
              Pre-Check
          </q-btn>
      </div>
  </div>
</template>

<script>
import { defineComponent, ref, watch } from 'vue'
import { useStore } from 'vuex'
import { useQuasar } from 'quasar'

export default defineComponent({
  name: 'PlanInfoPanel',
  setup() {
      const $q =useQuasar()
      const $store = useStore()
      let current = $store.state.qcl.current
      let inactive = ref(current===null)
      let planinfo = ref({
          LastName: 'Last',
          FirstName: 'First',
          PatientName: 'First, Last',
          MedicalRecordNumber: '04-20-xxxx',
          PlanName: 'nXXXX',
          Planner: 'Planer',
          Physician: 'Physician'
      })
      if (current) {
          planinfo.value = current.Plan.PlanInfo
      }

      watch(
        () => $store.state.qcl.current, 
        (newVal, _) => {
          inactive.value = newVal === null
          planinfo.value = newVal.Plan.PlanInfo
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
