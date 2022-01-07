<template>
  <div class="account-container">
    <NavBar
      :showMenu="false"
      :showBack="false"
      :showBackButton="true"
      :backClick="back"
      backLabel="Back"
    >
      <span class="account-title"
        >Account Details</span
      >
    </NavBar>
    <div class="account-content">
      <div class="account-content-top">
        account info
      </div>
      <div class="details-tabs">
    <ul class="nav nav-tabs">
    <li class="nav-item">
      <router-link
        class="nav-link"
        id="details-options-tab"
        :to="{ name: 'AccountDetailsOptions' }"
      >
        Options
      </router-link>
    </li>
    <li class="nav-item">
      <router-link
        class="nav-link"
        id="details-notes-tab"
        :to="{ name: 'AccountDetailsNotes' }"
      >
        Notes
      </router-link>
    </li>
  </ul>
   <div class="details-tab-content">
      <router-view></router-view>
    </div>
  </div>
    </div>

  </div>
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex'
import cryptoassets from '@/utils/cryptoassets'
import { chains } from '@liquality/cryptoassets'
import NavBar from '@/components/NavBar.vue'
import { shortenAddress } from '@/utils/address'
import { getAssetIcon, getAddressExplorerLink } from '@/utils/asset'
import { formatFontSize } from '@/utils/fontSize'

export default {
  components: {
    NavBar
  },
  data () {
    return {
      allowExportPrivateKey: false,
      addressCopied: false,
      address: null
    }
  },
  props: ['accountId', 'asset'],
  computed: {
    ...mapGetters(['accountItem']),
    ...mapState([
      'activeWalletId',
      'activeNetwork'
    ]),
    account () {
      return this.accountItem(this.accountId)
    },
    addressLink () {
      if (this.account) {
        return getAddressExplorerLink(
          this.address,
          this.asset,
          this.activeNetwork
        )
      }

      return '#'
    }
  },
  methods: {
    ...mapActions([
      'getUnusedAddresses'
    ]),
    getAssetIcon,
    shortenAddress,
    formatFontSize,
    async copyAddress () {
      await navigator.clipboard.writeText(this.address)
      this.addressCopied = true
      setTimeout(() => {
        this.addressCopied = false
      }, 2000)
    },
    back () {
      const { accountId, asset } = this.$route.params
      this.$router.push({ name: 'AccountAsset', params: { accountId, asset } })
    }
  },
  async created () {
    if (this.account?.type.includes('ledger')) {
      this.allowExportPrivateKey = false
      this.address = chains[cryptoassets[this.asset]?.chain]?.formatAddress(
        this.account.addresses[0],
        this.activeNetwork
      )
    } else {
      this.allowExportPrivateKey = true
      const addresses = await this.getUnusedAddresses({
        network: this.activeNetwork,
        walletId: this.activeWalletId,
        assets: [this.asset],
        accountId: this.accountId
      })
      const chainId = cryptoassets[this.asset]?.chain
      this.address = chains[chainId]?.formatAddress(
        addresses[0],
        this.activeNetwork
      )
    }
  }
}
</script>

<style lang="scss">
.account-container {
  .account-content-top {
    height: 220px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 20px 0;
    background: $brand-gradient-primary;
    color: $color-text-secondary;
    text-align: center;
    position: relative;
  }

  &_actions {
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 0 auto;

    &_button {
      display: flex;
      justify-content: center;
      align-items: center;
      flex-direction: column;
      width: 70px;
      border: 0;
      cursor: pointer;
      color: $color-text-secondary;
      background: none;
      font-weight: 600;
      font-size: 13px;

      &.disabled {
        opacity: 0.5;
        cursor: auto;
      }

      &_wrapper {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 44px;
        height: 44px;
        background: #ffffff;
        border-radius: 50%;
        margin-bottom: 4px;
      }

      &_icon {
        width: 16px;
        height: 16px;
      }

      &_swap {
        height: 30px;
      }
    }
  }

  &_address {
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;

    button {
      font-size: $h4-font-size;
      font-weight: normal;
      color: $color-text-secondary;
      border: 0;
      background: none;
      outline: none;
    }

    .eye-btn {
      position: absolute;
      right: 60px;
      height: 40px;
      width: 35px;
      background-color: transparent;
      display: flex;
      align-items: center;

      svg {
        width: 20px;
      }

      &:hover {
        opacity: 0.8;
      }
    }
  }
}

.details-tabs {
  margin: 0;
  padding: 0;
}
.nav-tabs {
  height: 48px;
  border-bottom: none !important;

  .nav-item {
    width: 50%;
    height: 100%;
    margin-bottom: none !important;

    .nav-link {
      height: 100%;
      font-size: $font-size-sm;
      font-weight: 500;
      text-transform: uppercase;
      color: #646f85;
      display: flex;
      align-items: center;
      justify-content: center;
      border: none !important;
      border-bottom: 1px solid $hr-border-color !important;
      padding: 0 !important;
    }

    .nav-link:hover,
    .router-link-active {
      color: #000d35;
      font-weight: 600;
      border: none !important;
      border-bottom: 1px solid #1d1e21 !important;
    }
  }
}

.details-tab-content {
    a {
      color: $color-text-primary;
    }
    a:hover {
      text-decoration: none;
    }
  }
</style>
