<template>
  <div class="wrapper">
    <div class="wrapper_top">
      <div class="step-detail">
        <div class="step-number">3</div>
        <div class="step-name">Accounts Added</div>
        <div class="step-icon">
          <LedgerIcon />
        </div>
      </div>
      <div class="final-message">
        The account(s) was added successfully, please close this tab and open the popup extension.
      </div>
    </div>
    <div class="wrapper_bottom">
      <button class="btn btn-primary btn-lg btn-icon" @click="close">Close this Tab</button>
    </div>
  </div>
</template>
<script>
import LedgerIcon from '@/assets/icons/ledger_icon.svg'

export default {
  components: {
    LedgerIcon
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
