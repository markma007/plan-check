/** Popup dialog component, children slots are encapsulated as contents */

<template>
  <div>
    <q-btn :label="title" @click="popUp = true">
      <div v-if="parseInt(badge) >= 0">
        &nbsp;&nbsp;<q-badge rounded color="green">{{ badge }}</q-badge>
      </div>
    </q-btn>
    <q-dialog v-model="popUp">
      <slot></slot>
    </q-dialog>
  </div>
</template>

<script>
import { defineComponent, ref, watch } from "vue";

export default defineComponent({
  name: "PopupWrapper",
  components: {},
  props: {
    title: { type: String, required: true },
    badge: { type: String, require: false, default: "-1" },
  },
  data() {
    return {
      popUp: false,
    };
  },
});
</script>

<style scoped></style>
