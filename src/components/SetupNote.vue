<template>
  <div class="q-mr-md" style="border:0px solid yellow;">
      <div class="q-ma-md">
        Setup Note
      </div>
      <q-input v-model="text" filled type="textarea" @change="onTextChange" />
    </div>
</template>

<script>
import { defineComponent, ref, watch } from 'vue'
import { useStore } from 'vuex'

export default defineComponent({
  name: 'SetupNote',
  setup() {
    const $store = useStore()
    const text = ref(
          $store.state.qcl.current ?
          $store.state.qcl.current.setupNote :
          '')
    watch(
        ()=>$store.state.qcl.current,
        (newVal, _) => {
            text.value = newVal ? newVal.setupNote : ''
        }
    )
    function onTextChange(t) {
        console.log('text changed', t)
        $store.dispatch('qcl/update_setup_note', t)
    }

    return {
        text,
        onTextChange
    }
  }
})
</script>
