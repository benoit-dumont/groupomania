<template>
  <div class="component-delete" @click="deleteAction">
    <i class="fa fa-trash-o"></i>
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
    deleteAction() {
      EventBus.$emit('deleteActionPressed', this.data);
    },
  },
};
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
