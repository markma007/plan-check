<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
        />

        <q-toolbar-title>
          Quick Check
        </q-toolbar-title>

        <div class="q-mr-sm">
          <q-btn @click="OpenPlanFolder" color="amber">
            Open Plan
          </q-btn>
        </div>

        <div>Version 1.0</div>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
    >
      <div class="flex flex-left q-ml-sm q-mt-lg">
        <q-toggle v-model="darkTheme" label="Dark theme"></q-toggle>
      </div>

      <div class="flex flex-center">
          <POIList />
          <div><my-dialog /></div>
          <div><task-list /></div>
      </div>
      <div class="flex flex-center fixed-bottom q-mb-md">
          <q-btn to="templates" label="Templates" style="min-width: 260px"></q-btn>
          <span>------------</span>
          <q-btn to="settings" label="Settings" style="min-width: 260px"></q-btn>
      </div>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>

    <q-footer>
      <q-toolbar elevated>
        <q-toolbar-title>
          Status
        </q-toolbar-title>
      </q-toolbar>
    </q-footer>
  </q-layout>
</template>

<script>
import { useQuasar } from 'quasar'
// import { useStore } from 'vuex'
import TaskList from 'components/TaskList.vue'
import MyDialog from 'components/MyDialog.vue'
import POIList from '../components/POIList.vue'
import { defineComponent, ref, watch } from 'vue'
// import { useRoute } from 'vue-router'

export default defineComponent({
  name: 'MainLayout',

  components: {
    TaskList, MyDialog, POIList
  },

  setup () {
    const $q = useQuasar()
    // const $router = useRoute()
    const leftDrawerOpen = ref(false)
    const darkTheme = ref($q.dark.mode)

    watch(darkTheme, (val, _)=>{
      $q.dark.set(val)
    })

    function OpenPlanFolder () {
      window.electron.OpenPlanFolder()
    }
    return {
      leftDrawerOpen,
      toggleLeftDrawer () {
        leftDrawerOpen.value = !leftDrawerOpen.value
      },
      darkTheme,
      OpenPlanFolder
    }
  }
})
</script>
