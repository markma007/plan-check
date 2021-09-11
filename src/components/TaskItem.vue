<template>
  <q-item
    clickable
    tag="a"
    target="_blank"
    @click="onSelect"
  >
    <q-item-section>
      <q-item-label>{{ mrn }}</q-item-label>
      <q-item-label caption>
        {{ planName }}
      </q-item-label>
    </q-item-section>
  </q-item>
</template>

<script>
import { defineComponent } from 'vue'
import { useStore } from 'vuex'
import { useQuasar, Notify } from 'quasar'

export default defineComponent({
  name: 'TaskItem',
  props: {
    mrn: {
      type: String,
      required: true
    },
    planName: {
      type: String,
      default: ''
    }
  },
  setup(props) {
    const $q = useQuasar()
    const $store = useStore()

    function onSelect (event) {
      let key = props.mrn + '-' + props.planName
      // $q.notify('Current set to ' + key)
      $store.dispatch('qcl/reset_current_task', key)
    }
    return {
      onSelect
    }
  }
})
</script>
