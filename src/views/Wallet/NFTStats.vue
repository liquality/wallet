<template>
  <div class="account-content-top">
    <RefreshIcon
      @click.stop="refresh"
      class="account-container_refresh-icon"
      id="refresh-icon"
      :class="{ 'infinity-rotate': updatingAssets }"
    />
    <div class="account-container_balance">
      <div>
        <span class="account-container_balance_value">
          {{ nftAssets.length || 0 }}
        </span>
        <span class="account-container_balance_code"
          >NFT<span v-if="nftAssets.length !== 1">s</span></span
        >
      </div>
    </div>
    <div class="account-container_actions">
      <router-link
        to="/wallet/nfts/send"
        :query="{ source: source }"
        class="account-container_actions_button send-action"
        id="send_action"
        v-if="nftAssets.length > 0"
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
import { mapActions, mapState } from 'vuex'
import SendIcon from '@/assets/icons/send.svg'
import { getAssetIcon } from '@/utils/asset'
import RefreshIcon from '@/assets/icons/refresh.svg'

export default {
  components: {
    SendIcon,
    RefreshIcon
  },
  data() {
    return {
      updatingAssets: false
    }
  },
  computed: {
    ...mapState(['nftAssets', 'activeWalletId', 'activeNetwork']),
    source() {
      return this.$route.fullPath
    }
  },
  methods: {
    ...mapActions(['getNFTAssets']),
    getAssetIcon,
    async refresh() {
      try {
        this.updatingAssets = true
        await this.getNFTAssets({
          network: this.activeNetwork,
          walletId: this.activeWalletId
        })
      } catch (error) {
        console.log(error)
      } finally {
        this.updatingAssets = false
      }
    }
  }
}
</script>

<style lang="scss">
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
