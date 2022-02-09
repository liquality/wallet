<template>
  <div class="enable d-flex flex-column flex-grow-1">
    <div class="popup-logo">
      <img :src="logo" />
    </div>
    <div class="enable-screen wrapper">
      <h2 class="text-center">Connect Request</h2>

      <div class="enable-screen_icon mt-2 text-center">{{ originShort }}</div>
      <p class="mt-1 mb-2 text-center">{{ originDomain }}</p>
      <div class="main-content">
        <div v-if="confirmStep">
          <p class="mt-2 mb-4 text-center">
            By granting permission to <strong id="origin_url">{{ origin }}</strong
            >, they can read your public account addresses.
          </p>
          <p class="text-primary text-center mb-4" id="make_sure_you_trust_this_site">
            Make sure you trust this site.
          </p>
        </div>
        <div v-else>
          <div class="d-flex justify-content-between">
            <h5>Select accounts</h5>
            <div v-if="isEthereumConnection" id="filter_by_chain">
              <ChainDropdown
                :chains="ethereumChains"
                :selected="selectedChain"
                @chain-changed="onChainSelected"
                select-label="Filter by chain"
                :right="true"
              />
            </div>
          </div>

          <div class="list-items">
            <NetworkAccounts
              @item-selected="onAccountSelected"
              :search="search"
              :account-id="selectedAccount ? selectedAccount.id : null"
              :accounts="accounts"
            />
          </div>
        </div>
      </div>
      <div class="wrapper_bottom">
        <div class="button-group">
          <button class="btn btn-light btn-outline-primary btn-lg" @click="reply(false)">
            Deny
          </button>
          <button
            v-if="loading"
            class="btn btn-primary btn-lg btn-icon loading"
            id="connect_request_button"
            disabled
          >
            <SpinnerIcon class="btn-loading" />
          </button>
          <button
            v-else-if="confirmStep"
            @click="reply(true)"
            id="connect_request_button"
            class="btn btn-primary btn-lg btn-icon"
          >
            Connect
          </button>
          <button
            v-else
            @click="confirmStep = true"
            id="connect_request_button"
            class="btn btn-primary btn-lg btn-icon"
            :disabled="!selectedAccount"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import { isEthereumChain, dappChains } from '@liquality/cryptoassets'
import LogoWallet from '@/assets/icons/logo_wallet.svg?inline'
import NetworkAccounts from '@/components/NetworkAccounts'
import ChainDropdown from '@/components/ChainDropdown'
import buildConfig from '@/build.config'

export default {
  components: {
    NetworkAccounts,
    ChainDropdown
  },
  data() {
    return {
      confirmStep: false,
      replied: false,
      loading: false,
      search: '',
      selectedAccount: null,
      selectedChain: null
    }
  },
  computed: {
    ...mapGetters(['accountsData', 'accountItem']),
    isEthereumConnection() {
      return isEthereumChain(this.chain)
    },
    accounts() {
      if (this.isEthereumConnection) {
        const ethereumAccounts = this.accountsData.filter((account) =>
          isEthereumChain(account.chain)
        )

        if (!this.selectedChain) {
          return ethereumAccounts
        }

        return ethereumAccounts.filter((account) => account.chain === this.selectedChain)
      } else {
        return this.accountsData.filter((account) => this.chain === account.chain)
      }
    },
    logo() {
      return LogoWallet
    },
    origin() {
      return this.$route.query.origin
    },
    chain() {
      return this.$route.query.chain
    },
    originShort() {
      return this.originDomain[0].toUpperCase()
    },
    originDomain() {
      return new URL(this.origin).hostname
    },
    originIcon() {
      return `https://s2.googleusercontent.com/s2/favicons?domain_url=${this.origin}`
    },
    ethereumChains() {
      return buildConfig.chains.filter(isEthereumChain)
    }
  },
  methods: {
    ...mapActions(['replyOriginAccess']),
    async reply(allowed) {
      await this.replyOriginAccess({
        origin: this.origin,
        allowed,
        accountId: this.selectedAccount ? this.selectedAccount.id : null
      })

      this.replied = true

      window.close()
    },
    onAccountSelected({ account }) {
      this.selectedAccount = account
    },
    onChainSelected(chain) {
      this.selectedChain = chain
      this.selectedAccount = this.accountsData.find(
        (account) => account.chain === this.selectedChain
      )
    },
    setDefaultSelectedChain() {
      const { hostname } = new URL(this.origin)
      const dapp = Object.keys(dappChains).find((origin) => {
        return hostname.includes(origin)
      })
      if (dapp) {
        const chainHasAccount = dappChains[dapp].find((chain) =>
          this.accountsData.find((account) => account.chain === chain)
        )
        if (chainHasAccount) {
          this.onChainSelected(chainHasAccount)
        }
      }
    }
  },
  created() {
    this.setDefaultSelectedChain()
  }
}
</script>

<style lang="scss">
.enable-screen {
  overflow-y: auto;
  overflow-x: hidden;
  &_icon {
    font-size: 40px;
    line-height: 74px;
    margin: 0 auto;
    color: white;
    width: 74px;
    height: 74px;
    background: #b6b6b6;
    border-radius: 50%;
  }
}

.enable {
  overflow-y: auto;
  overflow-x: hidden;

  .main-content {
    display: flex;
    flex-direction: column;

    .asset-list-header {
      display: flex;
      align-items: center;
      padding-left: 15px;
      padding-right: 15px;
      height: 70px;

      .input-group {
        align-items: center;
        height: 30px;

        input {
          padding-left: 20px;
        }

        svg {
          position: absolute;
          left: 0;
          top: 5px;
          width: 16px;
          margin-right: 8px;
        }
      }
    }

    .list-items {
      overflow-y: auto;
      padding-bottom: 80px;
    }
  }
}
</style>
