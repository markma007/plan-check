<template>
  <popup-wrapper title="Points of Interest" :badge="npoi">
    <POIListCard />
  </popup-wrapper>
</template>

<script>
import { defineComponent, computed } from "vue";
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
    const npoi = computed({
      get: () => {
        if ($store.state.qcl.current === null) {
          return 0
        } else {
          return $store.state.qcl.current.Plan.POIs.length
        }
      }
    })
    return {
      npoi
    };
  },
});
</script>
