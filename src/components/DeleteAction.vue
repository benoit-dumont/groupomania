<template>
  <div class="component-delete" @click="() => EventBus.emit('deleteActionPressed', props.data)">
    <i class="fa fa-trash-o"></i>
  </div>
</template>

<script setup lang="ts">
import EventBus from '../EventBus';

const props = defineProps<{
  data: number;
}>();
</script>

<style>
.component-delete {
  width: fit-content;
  transition: all 450ms ease-in-out;
}

.component-delete :hover {
  transition: all 450ms ease-in-out;
  color: red;
  transform: scale(1.11);
}
</style>
