<template>
  <Modal v-show="open" @close="close" :dialog="'modal-dialog-bottom'">
    <template #header>
      <h6>Buy Crypto</h6>
    </template>
    <template>
      <div class="provider">
        <BuyCryptoProviderBrand :provider="'transak'" />
        <p class="main-message">
          Transak lets you buy crypto with your credit card or via bank transfer depending on
          location. To cover fees (gas) or interact with dApps you’ll mostly need the gas token (the
          first token of the account).
        </p>
        <button class="btn btn-outline-primary" id="open_transak_tab_btn" @click="openProviderTab('transak')">
          Continue with Transak
        </button>
      </div>
      <div class="provider">
        <BuyCryptoProviderBrand :provider="'onramper'" />
        <p class="main-message">
          Onramper is an aggregated service providing the best quote from several sources and
          accepts popular payment methods depending on location.
        </p>
        <button class="btn btn-outline-primary" id="open_transak_tab_btn" @click="openProviderTab('onramper')">
          Continue with Onramper
        </button>
      </div>
    </template>
    <template #footer>
      <div class="footer">
        <p class="secondary-message">
          Fees and limits may vary. It usually takes just a couple of minutes and requires
          registration.
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
