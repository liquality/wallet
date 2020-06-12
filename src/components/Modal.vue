<template>
  <div>
    <div class="modal-backdrop"></div>
    <div class="modal d-block" tabindex="-1" role="dialog" v-on:click.passive="close">
      <div :class="{
        'modal-dialog modal-dialog-centered': true,
        [type]: true
      }" role="document">
        <div class="modal-content">
          <slot></slot>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    type: {
      type: String,
      default: 'modal-sm'
    }
  },
  methods: {
    close (e) {
      if (!e) return
      if (!e.target) return

      const { className } = e.target
      if (!className) return
      if (typeof className !== 'string') return

      if (className.split(' ').includes('modal')) {
        this.$emit('close')
      }
    }
  }
}
</script>

<style lang="scss">
.modal-backdrop {
  background-color: hsla(0, 0%, 0%, 0.5)!important;
}

.modal {
  overflow: auto!important;
}
</style>
