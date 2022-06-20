<template>
  <Modal v-show="open" @close="close" :dialog="'modal-dialog-bottom'">
    <template #header>
      <h6>Buy Crypto</h6>
    </template>
    <template>
      <p class="main-message">
        Transak lets you buy crypto with your credit card or via bank transfer depending on
        location. To cover fees (gas) or interact with dApps you’ll mostly need the gas token (the
        first token of the account).
      </p>
      <p class="secondary-message">
        Fees and limits may vary. It usually takes just a couple of minutes and requires
        registration.
      </p>
    </template>
    <template #footer>
      <div class="footer">
        <TransakBrand />
        <button class="btn btn-outline-primary" id="open_transak_tab_btn" @click="openTransakTab">
          Continue with Transak
        </button>
      </div>
    </template>
  </Modal>
</template>

<script>
import Modal from '@/components/Modal'
import TransakBrand from '@/components/BuyCrypto/TransakBrand'

import { mapActions, mapState } from 'vuex'

export default {
  components: {
    Modal,
    TransakBrand
  },
  computed: {
    ...mapState({
      open: (state) => state.app.buyCryptoModalOpen,
      modalData: (state) => state.app.buyCryptoModalData
    })
  },
  methods: {
    ...mapActions('app', ['setBuyCryptoModalOpen', 'openTransakWidgetTab', 'trackAnalytics']),
    close() {
      this.setBuyCryptoModalOpen({ open: false })
    },
    openTransakTab() {
      if (!this.modalData.chain || !this.modalData.asset || !this.modalData.address) {
        this.$router.push('/assets/buy')
      } else {
        this.openTransakWidgetTab({ ...this.modalData })
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

.footer {
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
</style>
