<template>
  <q-item>
    <div class="row content-center" style="width: 600px">
      <div class="col flex flex-center">{{ name }}</div>
      <div class="col flex flex-center">
        <div
          :class="klass"
          style="width: 20px; height: 20px; border-radius: 10px"
        />
      </div>
      <div class="col flex flex-center">{{ x }}</div>
      <div class="col flex flex-center">{{ y }}</div>
      <div class="col flex flex-center">{{ z }}</div>
      <div class="col flex flex-center">{{ feature }}</div>
      <div class="col set-as flex flex-center">
        <a>Set as</a>
        <q-menu>
          <q-list style="min-width: 100px">
            <q-item clickable v-close-popup @click="setAs('ISO')">
              <q-item-section>ISO</q-item-section>
            </q-item>
            <q-item clickable v-close-popup @click="setAs('SETUP')">
              <q-item-section>SETUP</q-item-section>
            </q-item>
            <q-item clickable v-close-popup @click="setAs('RX')">
              <q-item-section>RX</q-item-section>
            </q-item>
            <q-separator />
            <q-item clickable v-close-popup @click="setAs('---')">
              <q-item-section>NULL</q-item-section>
            </q-item>
          </q-list>
        </q-menu>
      </div>
    </div>
  </q-item>
</template>

<script>
import { defineComponent, ref, watch } from "vue";
import { useStore } from "vuex";

export default defineComponent({
  name: "PointOfInterest",
  props: {
    id: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    x: {
      type: Number,
      required: true,
    },
    y: {
      type: Number,
      required: true,
    },
    z: {
      type: Number,
      required: true,
    },
    color: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const feature = ref("");
    const klass = ref("bg-red");
    klass.value = "bg-" + props.color;
    if (props.name.toLowerCase().includes("iso")) {
      feature.value = "ISO";
    } else if (props.name.toLowerCase().includes("setup")) {
      feature.value = "SETUP";
    } else if (props.name.toLowerCase().includes("rx")) {
      feature.value = "RX";
    }
    function setAs(as) {
        console.log(props.id, as);
    }
    return {
      feature,
      klass,
      setAs
    };
  },
});
</script>

<style scoped>
.set-as:hover {
  background-color: lightgrey;
  cursor: pointer;
  color: blue;
}
.set-as{
  text-decoration: underline;
  text-underline-position: below;
}
</style>
