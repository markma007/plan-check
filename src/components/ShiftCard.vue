<template>
    <q-card>
      <q-card-section>
        <div class="text-h6">Shifts</div>
      </q-card-section>
      <q-card-section>
        xxx xxx xxx xxx xxx xxx xxx xxx xxx xxx xxx xxx xxx xxx xxx xxx xxx xxx
        xxx xxx xxx xxx xxx xxx yyy
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat label="Ok" color="primary" v-close-popup />
      </q-card-actions>
    </q-card>
</template>

<script>
import { defineComponent, ref, watch } from "vue";
import { useStore } from "vuex";

export default defineComponent({
  name: "ShiftCard",
  setup() {
    const $store = useStore();
    watch(
      () => $store.state.qcl.current,
      (newVal, _) => {}
    );
    return {};
  },
});
</script>

<style scoped></style>
