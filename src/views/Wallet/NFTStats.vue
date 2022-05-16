<template>
  <div class="account-content-top">
    <div class="account-container_balance">
      <div>
        <span class="account-container_balance_value">
          {{ nftAssetsNumber || 0 }}
        </span>
        <span class="account-container_balance_code"
          >NFT<span v-if="nftAssetsNumber !== 1">s</span></span
        >
      </div>
    </div>
    <div class="account-container_actions">
      <router-link
        to="/send-nft"
        class="account-container_actions_button send-action"
        id="send_action"
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
import { mapState } from 'vuex'
import SendIcon from '@/assets/icons/send.svg'
import { getAssetIcon } from '@/utils/asset'

export default {
  components: {
    SendIcon
  },
  computed: {
    ...mapState(['nftAssetsNumber'])
  },
  methods: {
    getAssetIcon
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
