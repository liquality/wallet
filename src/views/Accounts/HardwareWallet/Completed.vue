<template>
  <div class="wrapper">
    <div class="wrapper_top">
      <div class="step-detail">
        <div class="step-number">3</div>
        <div class="step-name">Accounts Added</div>
      </div>
      <div class="progress-container">
        <CircleProgressBar class="circle-progress" />
        <div class="loading-message">
          <div>
            <span class="loading-message-title">Success</span>
            <span class="loading-message-text">Accounts added</span>
          </div>
        </div>
      </div>
    </div>
    <div class="wrapper_bottom">
      <button class="btn btn-primary btn-lg btn-icon" @click="close">Close this Tab</button>
    </div>
  </div>
</template>
<script>
import CircleProgressBar from '@/assets/icons/circle_progress_bar.svg'

export default {
  components: {
    CircleProgressBar
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
