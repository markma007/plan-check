<template>
  <popup-wrapper title="Shifts">
    <shift-card />
  </popup-wrapper>
</template>

<script>
import { defineComponent } from "vue";
import PopupWrapper from "./PopupWrapper.vue";
import ShiftCard from './ShiftCard.vue'

export default defineComponent({
  name: "ShiftPopup",
  components: {
    PopupWrapper, ShiftCard
  },
  setup() {
    return {};
  },
});
</script>
