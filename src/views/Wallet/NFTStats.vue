<template>
  <div class="account-content-top" :style="{ 'justify-content': 'center' }">
    <RefreshIcon
      @click.stop="refresh"
      class="account-container_refresh-icon"
      id="refresh-icon"
      :class="{ 'infinity-rotate': updatingAssets }"
    />
    <div class="account-container_balance">
      <div>
        <div class="account-container_balance_value">
          {{ nftAssetsCount || 0 }}
          <span class="account-container_balance_code">
            {{ $t('pages.wallet.nfts', { count: nftAssetsCount }) }}
          </span>
        </div>
        <span class="account-container_balance_code" v-if="!isAccount && nftAssetsCount > 0">
          {{ $t('common.in') }} {{ accountsWithNFTs }}
          {{ $t('common.account', { count: accountsWithNFTs }) }}
        </span>
      </div>
    </div>
    <div class="account-container_address w-100" v-if="isAccount">
      <button
        class="btn btn-outline-primary"
        @click="copyAddress"
        v-tooltip.bottom="{
          content: addressCopied ? $t('common.copied') : $t('common.clickToCopy'),
          hideOnTargetClick: false
        }"
      >
        {{ shortenAddress(address) }}
      </button>
      <a
        class="eye-btn"
        :id="`${asset}_view_in_explorer`"
        @click="copyAddress"
        :href="addressLink"
        target="_blank"
        v-tooltip.bottom="{ content: $t('common.viewInExplorer') }"
      >
        <EyeIcon />
      </a>
    </div>
    <div class="account-container_actions mt-3" v-if="isAccount">
      <router-link
        :to="{ name: 'SendNFT', query: { source: source, accountId: id } }"
        class="account-container_actions_button send-action"
        id="send_action"
        v-if="nftAssetsCount > 0"
      >
        <div class="account-container_actions_button_wrapper">
          <SendIcon class="account-container_actions_button_icon" />
        </div>
        {{ $t('common.send') }}
      </router-link>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters, mapState } from 'vuex'
import SendIcon from '@/assets/icons/arrow_send.svg'
import { getAssetIcon } from '@/utils/asset'
import RefreshIcon from '@/assets/icons/refresh.svg'
import EyeIcon from '@/assets/icons/eye.svg'
import { shortenAddress } from '@liquality/wallet-core/dist/src/utils/address'
import { getChain, getNativeAssetCode } from '@liquality/cryptoassets'
import { getAddressExplorerLink } from '@liquality/wallet-core/dist/src/utils/asset'
import { reportLiqualityError } from '@liquality/error-parser'

export default {
  components: {
    SendIcon,
    RefreshIcon,
    EyeIcon
  },
  props: {
    isAccount: {
      type: Boolean,
      default: false
    },
    id: {
      type: String,
      required: false
    }
  },
  data() {
    return {
      updatingAssets: false,
      addressCopied: false,
      nftAssetsCount: 0
    }
  },
  created() {
    this.setNftAssetsCount()
  },
  computed: {
    ...mapState(['activeWalletId', 'activeNetwork', 'addresses']),
    ...mapGetters(['accountsData', 'accountNftCollections', 'allNftCollections']),
    source() {
      return this.$route.fullPath
    },
    nftAssets() {
      if (this.isAccount) {
        return this.accountNftCollections(this.id)
      } else {
        return this.allNftCollections
      }
    },
    account() {
      return this.accountsData.filter((account) => account.id === this.id)[0]
    },
    accountsWithNFTs() {
      return this.accountsData.filter((account) => account.nfts && account.nfts.length > 0).length
    },
    address() {
      if (this.isAccount) {
        return getChain(this.activeNetwork, this.account.chain)?.formatAddressUI(
          this.account.addresses[0]
        )
      }
      return ''
    },
    asset() {
      return getNativeAssetCode(this.activeNetwork, this.account.chain)
    },
    addressLink() {
      if (this.account) {
        return getAddressExplorerLink(this.address, this.asset, this.activeNetwork)
      }
      return '#'
    }
  },
  methods: {
    ...mapActions(['updateNFTs']),
    getAssetIcon,
    shortenAddress,
    async refresh() {
      const accountIds = this.accountsData.map((account) => {
        return account.id
      })
      try {
        this.updatingAssets = true
        await this.updateNFTs({
          walletId: this.activeWalletId,
          network: this.activeNetwork,
          accountIds: accountIds
        })
      } catch (error) {
        reportLiqualityError(error)
      } finally {
        this.updatingAssets = false
      }
    },
    async copyAddress() {
      await navigator.clipboard.writeText(this.address)
      this.addressCopied = true
      setTimeout(() => {
        this.addressCopied = false
      }, 2000)
    },
    setNftAssetsCount() {
      this.nftAssetsCount = Object.values(this.nftAssets).reduce((acc, nft) => acc + nft.length, 0)
    }
  },
  watch: {
    accountNftCollections(newValue, oldValue) {
      if (newValue !== oldValue) {
        this.setNftAssetsCount()
      }
    },
    allNftCollections(newValue, oldValue) {
      if (newValue !== oldValue) {
        this.setNftAssetsCount()
      }
    }
  }
}
</script>

<style lang="scss" scoped>
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

.account-container_balance {
  display: flex;
  align-items: center;
  justify-content: center;

  &_value {
    font-size: 66px;
  }

  &_code {
    font-size: 20px;
    line-height: 36px;
  }
}

.account-container_address {
  font-weight: 500;
  line-height: 24px;

  button {
    border: initial;
  }
  .eye-btn {
    position: absolute;
    right: 70px;
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

.account-container_actions {
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
  }
}

button:disabled {
  opacity: 0.5;
  cursor: auto;
}
</style>
