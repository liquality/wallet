<template>
  <div class="wrapper">
    <div class="wrapper_top">
      <div class="step-detail">
        <div class="step-number">3</div>
        <div class="step-name">{{ $t('pages.accounts.accountsAdded') }}</div>
      </div>
      <div class="progress-container">
        <CircleProgressBar class="circle-progress" />
        <div class="loading-message">
          <div>
            <span class="loading-message-title">{{ $t('common.success') }}</span>
            <span class="loading-message-text">{{ $t('pages.accounts.accountsAdded') }}</span>
          </div>
        </div>
      </div>
      <div class="row mt-5" v-if="showEvmMessage">
        <div class="col text-center">
          {{ $t('pages.accounts.allEvmLedgerEnabled.message') }}
          <router-link :to="{ name: 'ManageAccounts' }">
            {{ $t('pages.accounts.allEvmLedgerEnabled.manage') }} </router-link
          >.
        </div>
      </div>
    </div>
    <div class="wrapper_bottom">
      <button class="btn btn-primary btn-lg btn-icon" @click="close">
        {{ $t('pages.accounts.closeThisTab') }}
      </button>
    </div>
  </div>
</template>
<script>
import CircleProgressBar from '@/assets/icons/circle_progress_bar.svg'
import { ChainId } from '@liquality/cryptoassets'

export default {
  props: {
    selectedAsset: {
      type: Object
    }
  },
  components: {
    CircleProgressBar
  },
  computed: {
    showEvmMessage() {
      if (this.selectedAsset) {
        const { chain } = this.selectedAsset
        return chain === ChainId.Ethereum
      }
      return false
    }
  },
  methods: {
    close() {
      chrome.tabs.getCurrent((tab) => {
        if (tab !== undefined) {
          chrome.tabs.remove([tab.id])
        }
      })
    }
  }
}
</script>

<style lang="scss">
.final-message {
  position: absolute;
  margin-top: 100px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 360px;
  color: #1d1e21;
  height: 120px;
  background-color: rgba($color: #fff3bc, $alpha: 0.5);
  padding: 5px 20px 5px 20px;
  font-style: normal;
  font-weight: 300;
  font-size: 14px;
  line-height: 16px;
}
</style>
