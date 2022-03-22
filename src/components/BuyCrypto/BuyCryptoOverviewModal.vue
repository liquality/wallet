<template>
  <Modal v-show="open" @close="close">
    <template #header>
      <h6>Getting Started with Crypto is Easy</h6>
    </template>
    <template>
      <div class="top">
        <p class="first-message">All you need to do is deposit Crypto to your Liquality wallet.</p>
        <div @click="receive" class="receive-action">
          <ReceiveIconPrimary class="receive-icon" />
          Receive
        </div>
      </div>
      <p class="second-message">
        If you don't have any crypto to deposit, no worries. You can easily buy crypto with our
        trusted partner. We recommend to start with ETH to also be able to cover fees (called gas).
      </p>
    </template>
    <template #footer>
      <div class="footer">
        <TransakBrand />
        <button class="btn btn-primary btn-lg" id="open_transak_tab_btn" @click="openTransakTab">
          Buy Crypto
        </button>
      </div>
    </template>
  </Modal>
</template>

<script>
import Modal from '@/components/Modal'
import TransakBrand from '@/components/BuyCrypto/TransakBrand'
import ReceiveIconPrimary from '@/assets/icons/receive_icon_primary.svg'

import { mapActions, mapState } from 'vuex'
export default {
  components: {
    Modal,
    TransakBrand,
    ReceiveIconPrimary
  },
  computed: {
    ...mapState({
      open: (state) => state.app.buyCryptoOverviewModalOpen
    })
  },
  methods: {
    ...mapActions('app', ['setBuyCryptoOverviewModalOpen', 'openTransakWidgetTab']),
    close() {
      this.setBuyCryptoOverviewModalOpen({ open: false })
    },
    openTransakTab() {
      this.openTransakWidgetTab({ ...this.data })
    },
    receive() {
      this.setBuyCryptoOverviewModalOpen({ open: false })
      this.$router.push('/assets/receive')
    }
  }
}
</script>

<style lang="scss" scoped>
h6 {
  font-style: normal;
  font-weight: 600;
  font-size: 14px;
  letter-spacing: 2px;
  text-transform: uppercase;
}

.top {
  display: flex;
  flex-direction: column;
  align-items: center;
  border-bottom: 1px solid #d9dfe5;
}

.receive-action {
  color: #9d4dfa;
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin-bottom: 1em;

  svg {
    height: 50px;
  }
}
.receive-text {
  font-style: normal;
  font-weight: 600;
  font-size: 13px;
  line-height: 18px;
  text-align: center;
  letter-spacing: -0.08px;

  color: #9d4dfa;
}

.first-message,
.second-message {
  font-style: normal;
  font-weight: 300;
  font-size: 13px;
  line-height: 16px;
  color: #646f85;
}

.second-message {
  margin-top: 20px;
}

.footer {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin-bottom: 20px;
  width: 100%;

  .btn {
    margin-top: 20px;
    padding: 0.5rem 1.5rem;
    width: 100%;
  }
}
</style>
