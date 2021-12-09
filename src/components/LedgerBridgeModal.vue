<template>
   <Modal v-if="open" @close="onClose">
      <template v-slot:title>
        Ledger USB Web Bridge
      </template>
      <p>
        This allows to connect to your Ledger device.
        Please click on Enable USB button inside the bridge
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
