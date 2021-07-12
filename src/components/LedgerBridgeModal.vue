<template>
   <Modal v-if="open" @close="onClose">
      <template #title>
        Ledger USB Web Bridge
      </template>
      <p>
        This allows to connect to your Ledger device.
      </p>
       <template #footer>
       <button class="btn btn-outline-clear" @click="openBridgeWindow">
         Open Ledger USB Bridge
       </button>
      </template>
    </Modal>
</template>

<script>
import Modal from '@/components/Modal'
import { mapActions } from 'vuex'

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
    ...mapActions('app', [
      'startBridgeListener',
      'openUSBBridgeWindow'
    ]),
    async openBridgeWindow () {
      await this.startBridgeListener()
      await this.openUSBBridgeWindow()
    },
    onClose () {
      this.$emit('close')
    }
  }
}
</script>

<style lang="scss">

</style>
