<template>
  <popup-wrapper title="Points of Interest" :badge="npoi">
    <POIListCard />
  </popup-wrapper>
</template>

<script>
import { defineComponent, computed, watch } from "vue";
import { useStore } from 'vuex';

import PopupWrapper from "./PopupWrapper.vue";
import POIListCard from './POIListCard.vue'

export default defineComponent({
  name: "POIListPopup",
  components: {
    PopupWrapper, POIListCard
  },
  setup() {
    const $store = useStore()
    let npoi = computed({ // number of POI as String
      get: () => {
        let n = 0
        if ($store.state.qcl.current) {
          n = $store.state.qcl.current.Plan.POIs.length
        }
        return n.toString()
      },
      set: val => {
        npoi = val;
      }
    })
    watch(
        () => $store.state.qcl.current,
        (newVal, _) => {
          let n = newVal ? newVal.Plan.POIs.length : 0
          npoi = n.toString()
      })
    return {
      npoi
    };
  },
});
</script>
