<template>
   <Modal v-if="open" @close="onClose">
      <template v-slot:title>
        Connect Ledger via USB WEB BRIDge
      </template>
      <p>
        This allows to connect to your Ledger device. Please click on the ‘Connect’ button. in the window next to it.
      </p>
    </Modal>
</template>

<script>
import Modal from '@/components/Modal'

export default {
  components: {
    Modal
  },
  props: {
    open: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    onClose () {
      this.$emit('close')
    }
  }
}
</script>

<style lang="scss">

</style>
