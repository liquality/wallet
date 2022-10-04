<template>
  <Modal v-show="open" @close="close" :dialog="'modal-dialog-bottom'">
    <template #header>
      <h6>{{ $t('components.buyCrypto.buyCrypto') }}</h6>
    </template>
    <template>
      <div class="provider">
        <BuyCryptoProviderBrand :provider="'transak'" />
        <p class="main-message">
          {{ $t('components.buyCrypto.transakInstructions') }}
        </p>
        <button
          class="btn btn-outline-primary"
          id="open_transak_tab_btn"
          @click="openProviderTab('transak')"
        >
          {{ $t('components.buyCrypto.continueWithTransak') }}
        </button>
      </div>
      <div class="provider">
        <BuyCryptoProviderBrand :provider="'onramper'" />
        <p class="main-message">
          {{ $t('components.buyCrypto.onramperDescription') }}
        </p>
        <button
          class="btn btn-outline-primary"
          id="open_transak_tab_btn"
          @click="openProviderTab('onramper')"
        >
          {{ $t('components.buyCrypto.continueWithOnramper') }}
        </button>
      </div>
    </template>
    <template #footer>
      <div class="footer">
        <p class="secondary-message">
          {{ $t('components.buyCrypto.feeAndLimitMessage') }}
        </p>
      </div>
    </template>
  </Modal>
</template>

<script>
import Modal from '@/components/Modal'
import BuyCryptoProviderBrand from '@/components/BuyCrypto/BuyCryptoProviderBrand'

import { mapActions, mapState } from 'vuex'

export default {
  components: {
    Modal,
    BuyCryptoProviderBrand
  },
  computed: {
    ...mapState({
      open: (state) => state.app.buyCryptoModalOpen,
      modalData: (state) => state.app.buyCryptoModalData
    })
  },
  methods: {
    ...mapActions('app', [
      'setBuyCryptoModalOpen',
      'openTransakWidgetTab',
      'openOnramperWidgetTab'
    ]),
    close() {
      this.setBuyCryptoModalOpen({ open: false })
    },
    openProviderTab(provider) {
      if (!this.modalData.chain || !this.modalData.asset || !this.modalData.address) {
        this.$router.push(`/assets/buy?provider=${provider}`)
      } else {
        if (provider === 'transak') {
          this.openTransakWidgetTab({ ...this.modalData })
        } else if (provider === 'onramper') {
          this.openOnramperWidgetTab({ ...this.modalData })
        }
      }
      this.setBuyCryptoModalOpen({ open: false })
    }
  }
}
</script>

<style lang="scss" scoped>
h6 {
  font-style: normal;
  font-weight: 400;
  font-size: 20px;
  line-height: 30px;
}

.main-message,
.secondary-message {
  font-style: normal;
  font-weight: 400;
  font-size: 12px;
  line-height: 20px;
  color: #000d35;
}

.provider {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin-bottom: 20px;

  .btn {
    margin-top: 20px;
    width: 100%;
    padding: 0.5rem 1.5rem;
    border-radius: 22px;
  }
}

.footer {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin-bottom: 20px;
}
</style>
