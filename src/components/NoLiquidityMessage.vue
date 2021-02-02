<template>
  <div class="notification-content">
    <div>No liquidity for this pair.</div>
    <div>Request it via
      <button class="btn btn-option liq-telegram-btn"
              @click="openTelegramLink">
        Liquality Telegram
      </button>
    </div>
  </div>
</template>

<script>
import buildConfig from '../build.config'

export default {
  methods: {
    openTelegramLink () {
      chrome.tabs.create({ url: buildConfig.telegramUrl })
    }
  }
}
</script>
<style lang="scss" scoped>
.notification-content {
  height: 65px;
  display: flex;
  flex-direction: column;
  width: 100%;
  justify-content: center;

  .liq-telegram-btn {
    margin-left: 4px;
    width: 130px;
    display: inline-block;
  }
}
</style>
