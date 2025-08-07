<template>
  <div class="component-modify" @click="() => EventBus.emit('modifyActionPressed', props.data)">
    <i class="fa fa-pencil"></i>
  </div>
</template>

<script setup lang="ts">
import EventBus from '../EventBus';

const props = defineProps<{
  data: number;
}>();
</script>

<style>
.component-modify {
  width: fit-content;
  transition: all 450ms ease-in-out;
  cursor: pointer;
}

.component-modify :hover {
  color: var(--app-primary-color);
  transform: scale(1.11);
}
</style>
