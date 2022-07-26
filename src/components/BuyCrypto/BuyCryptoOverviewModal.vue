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
    </template>
    <template #footer>
      <div class="footer">
        <h6 class="footer-title">Buy Crypto</h6>
        <div class="provider">
          <BuyCryptoProviderBrand :provider="'transak'" />
          <p class="first-message">
            Transak lets you buy crypto with your credit card or via bank transfer depending on
            location. To cover fees (gas) or interact with dApps you’ll mostly need the gas token
            (the first token of the account).
          </p>
          <button
            class="btn btn-outline-primary btn-lg"
            id="open_transak_tab_btn"
            @click="openSelectAccount('transak')"
          >
            Buy Crypto with Transak
          </button>
        </div>
        <div class="provider">
          <BuyCryptoProviderBrand :provider="'onramper'" />
          <p class="first-message">
            Onramper is an aggregated service providing the best quote from several sources and
            accepts popular payment methods depending on location.
          </p>
          <button
            class="btn btn-outline-primary btn-lg"
            id="open_transak_tab_btn"
            @click="openSelectAccount('onramper')"
          >
            Buy Crypto with Onramper
          </button>
        </div>
        <p class="third-message">
          Fees and limits may vary. It usually takes just a couple of minutes and requires
          registration.
        </p>
      </div>
    </template>
  </Modal>
</template>

<script>
import Modal from '@/components/Modal'
import ReceiveIconPrimary from '@/assets/icons/receive_icon_primary.svg'
import BuyCryptoProviderBrand from '@/components/BuyCrypto/BuyCryptoProviderBrand'

import { mapActions, mapState } from 'vuex'
export default {
  components: {
    Modal,
    BuyCryptoProviderBrand,
    ReceiveIconPrimary
  },
  computed: {
    ...mapState({
      open: (state) => state.app.buyCryptoOverviewModalOpen
    })
  },
  methods: {
    ...mapActions('app', ['setBuyCryptoOverviewModalOpen']),
    close() {
      this.setBuyCryptoOverviewModalOpen({ open: false })
    },
    openSelectAccount(provider) {
      this.setBuyCryptoOverviewModalOpen({ open: false })
      this.$router.push(`/assets/buy?provider=${provider}`)
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

  .footer-title {
    margin-bottom: 20px;
  }

  .provider {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    margin-bottom: 20px;
  }

  .btn {
    margin-top: 5px;
    padding: 0.5rem 1.5rem;
    width: 100%;
  }
}
</style>
