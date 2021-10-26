<template>
   <Modal v-if="open" @close="onClose">
      <template #header>
        <div class="text-center text-danger">
          Oooops...
        </div>
      </template>
       <div class="justify-content-center"
            v-if="account && account.type.includes('ledger')">
         <div class="modal-title d-flex justify-content-center">
          Can’t find the ledger Account
        </div>
         <div class="step-icon d-flex justify-content-center">
          <LedgerIcon />
        </div>
         <ul class="step-instructions align-self-start">
          <li>Plug the Ledger into the computer</li>
          <li>Enter pin to unlock it</li>
          <li>
           On the Ledger, navigate to the asset you want to access
          </li>
          <li>
           Once connected follow the prompts on the Ledger
          </li>
        </ul>
        <p class="text-center text-break">
            {{ error }}
          </p>
      </div>
      <div v-else class="justify-content-center">
        <p class="text-center text-break">
            {{ error }}
          </p>
      </div>
       <template #footer>
       <button class="btn btn-outline-clear" @click="onClose">
         Ok
       </button>
      </template>
    </Modal>
</template>

<script>
import Modal from '@/components/Modal'
import LedgerIcon from '@/assets/icons/ledger_icon.svg'

export default {
  components: {
    Modal,
    LedgerIcon
  },
  props: {
    account: {
      type: Object,
      default: null
    },
    open: {
      type: Boolean,
      default: false
    },
    error: {
      type: String,
      default: ''
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
