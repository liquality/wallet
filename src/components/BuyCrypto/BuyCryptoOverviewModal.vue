<template>
  <Modal v-show="open" @close="close">
    <template #header>
      <h6>Getting Started with Crypto is Easy</h6>
    </template>
    <template>
      <div class="top">
        <p class="first-message">
          We recommend to start with sending ETH to your Liquality wallet because that fuels many
          transactions.
        </p>
        <div @click="receive" class="receive-action">
          <ReceiveIconPrimary class="receive-icon" />
          Receive
        </div>
      </div>
      <p class="second-message">You can also buy crypto at our trusted partner.</p>
      <p class="third-message">
        Fees and limits may vary. It usually takes just a couple of minutes and requires
        registration.
      </p>
    </template>
    <template #footer>
      <div class="footer">
        <TransakBrand />
        <button
          class="btn btn-outline-primary btn-lg"
          id="open_transak_tab_btn"
          @click="openTransakTab"
        >
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
  font-weight: 400;
  font-size: 20px;
  line-height: 30px;
}

.top {
  display: flex;
  flex-direction: column;
  align-items: center;
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
.second-message,
.third-message {
  margin-top: 1.2rem;
}
.first-message,
.second-message {
  font-style: normal;
  font-weight: 300;
  font-size: 16px;
  line-height: 20px;
  color: #000d35;
}

.second-message {
  margin-top: 20px;
}

.third-message {
  font-style: normal;
  font-weight: 400;
  font-size: 12px;
  line-height: 15px;
  letter-spacing: -0.08px;
  color: #000d35;
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
