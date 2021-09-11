<template>
    <q-card>
      <q-card-section>
        <div class="text-h6">Points of Interest</div>
      </q-card-section>
      <q-card-section>
        <q-list>
          <q-item>
            <div class="row" style="width: 600px">
              <div class="col flex flex-center"><b>Name</b></div>
              <div class="col flex flex-center"><b>Color</b></div>
              <div class="col flex flex-center"><b>X</b></div>
              <div class="col flex flex-center"><b>Y</b></div>
              <div class="col flex flex-center"><b>Z</b></div>
              <div class="col flex flex-center"><b>Type</b></div>
              <div class="col flex flex-center"><b></b></div>
            </div>
          </q-item>
          <q-separator></q-separator>
          <point-of-interest
            v-for="poi in pois"
            :id="`${poi.id}`"
            :key="poi.id"
            :name="poi.Name"
            :x="poi.XCoord"
            :y="poi.YCoord"
            :z="poi.ZCoord"
            :color="poi.Color"
          />
          <q-separator></q-separator>
        </q-list>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat label="Ok" color="primary" v-close-popup />
      </q-card-actions>
    </q-card>
</template>

<script>
import { defineComponent, computed, ref } from "vue";
import { useStore } from "vuex";

import PointOfInterest from "./PointOfInterest.vue";

export default defineComponent({
  name: "POIListCard",
  components: {
    PointOfInterest,
  },
  setup() {
    const $store = useStore();
    const pois = computed({
      get: () => {
        if ($store.state.qcl.current===null) {
          return []
        } else {
          return $store.state.qcl.current.Plan.POIs
        }
      },
      set: val => {
        console.log('//setting pois in POIListCard//');
        console.log('// ignored ==> not allowed');
      }
    })

    return {
      pois
    };
  },
});
</script>

<style scoped></style>
