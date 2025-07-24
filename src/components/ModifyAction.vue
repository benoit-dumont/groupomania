<template>
  <div class="component-modify" @click="modifyUser">
    <i class="fa fa-pencil"></i>
  </div>
</template>

<script>
import EventBus from '../EventBus';

export default {
  props: {
    data: {
      type: Object,
      required: true,
    },
  },
  methods: {
    modifyUser() {
      EventBus.$emit('modifyActionPressed', this.data);
    },
  },
};
</script>

<style>
.component-modify {
  width: fit-content;
  transition: all 450ms ease-in-out;
}

.component-modify :hover {
  color: var(--app-primary-color);
  transform: scale(1.11);
}
</style>
