<template>
  <div
    class="account-content-top"
    :style="nftAssetsCount > 0 ? { 'justify-content': 'center' } : {}"
  >
    <RefreshIcon
      @click.stop="refresh"
      class="account-container_refresh-icon"
      id="refresh-icon"
      :class="{ 'infinity-rotate': updatingAssets }"
    />
    <div class="account-container_balance" :style="isAccount ? { visibility: 'hidden' } : {}">
      <div>
        <span class="account-container_balance_value">
          {{ nftAssetsCount || 0 }}
        </span>
        <span class="account-container_balance_code"
          >NFT<span v-if="nftAssetsCount !== 1">s</span></span
        >
      </div>
    </div>
    <div class="account-container_address w-100" v-show="isAccount">
      <button
        class="btn btn-outline-primary"
        @click="copyAddress"
        v-tooltip.bottom="{
          content: addressCopied ? 'Copied!' : 'Click to copy',
          hideOnTargetClick: false
        }"
      >
        {{ shortenAddress(address) }}
      </button>
    </div>
    <div class="account-container_actions mt-3" v-show="isAccount">
      <router-link
        :to="{ name: 'SendNFT', query: { source: source, chain: chain } }"
        class="account-container_actions_button send-action"
        id="send_action"
        v-if="nftAssetsCount > 0"
      >
        <div class="account-container_actions_button_wrapper">
          <SendIcon class="account-container_actions_button_icon" />
        </div>
        Send
      </router-link>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters, mapState } from 'vuex'
import SendIcon from '@/assets/icons/send.svg'
import { getAssetIcon } from '@/utils/asset'
import RefreshIcon from '@/assets/icons/refresh.svg'
import { shortenAddress } from '@liquality/wallet-core/dist/utils/address'
import { chains } from '@liquality/cryptoassets'

export default {
  components: {
    SendIcon,
    RefreshIcon
  },
  props: {
    isAccount: {
      type: Boolean,
      default: false
    },
    chain: {
      type: String,
      required: false
    }
  },
  data() {
    return {
      updatingAssets: false,
      addressCopied: false
    }
  },
  computed: {
    ...mapState(['activeWalletId', 'activeNetwork', 'addresses']),
    ...mapGetters(['accountsData', 'nftAssetsByAccount', 'nftAssetsByCollection']),
    source() {
      return this.$route.fullPath
    },
    nftAssets() {
      if (this.isAccount) {
        return this.nftAssetsByAccount[this.chain]
      } else {
        return this.nftAssetsByCollection
      }
    },
    nftAssetsCount() {
      return Object.values(this.nftAssets).reduce((acc, collection) => acc + collection.length, 0)
    },
    address() {
      if (this.isAccount) {
        return chains[this.chain]?.formatAddress(
          this.accountsData.filter((account) => account.chain === this.chain)[0].addresses[0],
          this.activeNetwork
        )
      }
      return ''
    }
  },
  methods: {
    ...mapActions(['getNFTAssets']),
    getAssetIcon,
    shortenAddress,
    async refresh() {
      try {
        this.updatingAssets = true
        await this.getNFTAssets({
          walletId: this.activeWalletId,
          network: this.activeNetwork
        })
      } catch (error) {
        console.log(error)
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
}

.account-container_address {
  font-weight: 500;
  line-height: 24px;

  button {
    font-size: 12px;
    color: #9d4dfa;
    border-radius: 22px;
    background: #f8faff;
    border: initial;
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
