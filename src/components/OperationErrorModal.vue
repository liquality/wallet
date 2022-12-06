<template>
  <Modal v-if="open" @close="onClose">
    <template #header>
      <div class="text-center text-danger">Oooops...</div>
    </template>
    <div class="justify-content-center" v-if="account && account.type.includes('ledger')">
      <div class="modal-title d-flex justify-content-center">
        {{ $t('components.operationErrorModal.cantFindAccount') }}
      </div>
      <div class="step-icon d-flex justify-content-center">
        <LedgerIcon />
      </div>
      <ul class="step-instructions align-self-start">
        <li>{{ $t('components.operationErrorModal.instructions1') }}</li>
        <li>{{ $t('components.operationErrorModal.instructions2') }}</li>
        <li>{{ $t('components.operationErrorModal.instructions3') }}</li>
        <li>{{ $t('components.operationErrorModal.instructions4') }}</li>
      </ul>
      <p class="text-center text-break">
        {{ translatedError }}
      </p>
    </div>
    <div v-else class="justify-content-center">
      <p class="text-center text-break">{{ translatedError }}</p>
    </div>
    <template #footer>
      <div class="buttons">
        <button class="ok-button btn btn-outline-clear" @click="onClose">
          {{ $t('common.ok') }}
        </button>
        <CopyError
          :translatedError="translatedError"
          :liqualityErrorString="liqualityErrorString"
        />
      </div>
    </template>
  </Modal>
</template>

<script>
import Modal from '@/components/Modal'
import LedgerIcon from '@/assets/icons/ledger_icon.svg'
import CopyError from './CopyError.vue'

export default {
  components: {
    Modal,
    LedgerIcon,
    CopyError
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
    liqualityErrorString: {
      type: String,
      default: ''
    }
  },
  methods: {
    onClose() {
      this.$emit('close')
    }
  },
  computed: {
    translatedError() {
      return this.$tle(this.liqualityErrorString)
    }
  }
}
</script>

<style lang="scss">
.buttons {
  display: flex;
  flex-wrap: wrap;
}
.ok-button {
  flex-basis: 50%;
  max-width: 20% !important;
}
</style>
