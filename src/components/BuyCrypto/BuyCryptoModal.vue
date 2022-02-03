<template>
  <Modal v-show="open" @close="close">
    <template #header>
      <h6>Buy Crypto</h6>
    </template>
    <template>
      <p class="main-message">
        Transak lets you buy multiple assets with your credit card or via bank transer depending on
        location straight into your Liquality wallet. To cover fees (gas) or interact with DApps
        you'll mostly need ETH.
      </p>
      <p class="secondary-message">
        Fees and limits may vary. It usually takes just a couple of minutes and requires
        registration.
      </p>
    </template>
    <template #footer>
      <div class="footer">
        <TransakBrand />
        <button class="btn btn-primary btn-lg" id="open_transak_tab_btn" @click="openTransakTab">
          Continue to Transak
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
      data: (state) => state.app.buyCryptoModalData
    })
  },
  methods: {
    ...mapActions('app', ['setBuyCryptoModalOpen', 'openTransakWidgetTab']),
    close() {
      this.setBuyCryptoModalOpen({ open: false })
    },
    openTransakTab() {
      this.openTransakWidgetTab({ ...this.data })
      setTimeout(() => {
        this.setBuyCryptoModalOpen({ open: false })
      }, 2000)
    }
  }
}
</script>

<style lang="scss" scoped>
h6 {
  font-style: normal;
  font-weight: 600;
  font-size: 14px;
  line-height: 20px;
  text-transform: uppercase;
}

.main-message {
  font-style: normal;
  font-weight: 300;
  font-size: 13px;
  line-height: 20px;
  color: #000d35;
}
.secondary-message {
  font-style: normal;
  font-weight: 300;
  font-size: 10px;
  line-height: 16px;
  color: #646f85;
}

.footer {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin-bottom: 20px;

  .btn {
    margin-top: 20px;
    padding: 0.5rem 1.5rem;
  }
}
</style>
