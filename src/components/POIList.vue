<template>
    <div>
        <q-btn label="Points of Interest" @click="poisShow=true">
            <q-badge>{{pois.length}}</q-badge>
        </q-btn>
        <q-dialog v-model="poisShow">
            <q-card>
                <q-card-section>
                    <div class="text-h6">Points of Interest</div>
                </q-card-section>
                <q-card-section>
                    <q-list>
                        <q-item>
                          <div class="row" style="width:600px;">
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
                        <point-of-interest v-for="poi in pois" 
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
        </q-dialog>
    </div>
</template>

<script>
import { defineComponent, ref, watch } from 'vue'
import { useStore } from 'vuex'

import PointOfInterest from './PointOfInterest.vue'

export default defineComponent({
    name: "POIList",
    components: {
        PointOfInterest
    },
    setup() {
        const $store = useStore()
        const pois = ref([])
        const poisShow = ref(false)
        watch(
          () => $store.state.qcl.current, 
          (newVal, _) => {
              if (newVal) {
                  pois.value = newVal.Plan.POIs
              } else {
                  pois.value = []
              }
        })
        return {
            pois,
            poisShow
        }
    },
})
</script>

<style scoped>

</style>