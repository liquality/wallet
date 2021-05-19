<template>
   <Modal v-if="open" @close="onClose">
      <template #header>
         <h5>
           Initiate
         </h5>
      </template>
       <template>
         <div class="modal-title">
           On Your Ledger
         </div>
         <div class="ledger-options-container">
         <div class="ledger-options-instructions">
          Follow prompts to verify and accept the amount, then confirm the transaction. There may be a lag.
        </div>
        <p>
          <LedgerSignRquest class="ledger-sign-request"/>
        </p>
      </div>
       </template>
    </Modal>
</template>

<script>
import Modal from '@/components/Modal'
import LedgerSignRquest from '@/assets/icons/ledger_sign_request.svg'

export default {
  components: {
    Modal,
    LedgerSignRquest
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
svg.ledger-sign-request {
  margin-top: 5px;
  width: 320px;
}

.ledger-options-instructions {
  margin-top: 10px;
  align-self: start;
  padding-left: 0px !important;
  font-weight: 300;
  font-size: 14px;
  line-height: 20px;
}
</style>
