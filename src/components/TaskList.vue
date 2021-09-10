<template>
    <q-list>
        <q-item-label
          header
        >
          <b>Active Checks</b>
        </q-item-label>

        <task-item
          v-for="task in tasks"
          :key="task.mrn"
          v-bind="task"
        />
    </q-list>
</template>

<script>
import { defineComponent } from 'vue'
import { useStore } from 'vuex'
import TaskItem from './TaskItem.vue'

export default defineComponent({
  name: 'TaskList',
  components: {
    TaskItem
  },
  setup() {
    const $store = useStore()
    return {
      tasks: $store.state.qcl.tasks,
    }
  }
})
</script>