<template>
  <div class="notification-content">
    <div>No liquidity.</div>
    <div>Request liquidity for tokens via<button class="btn btn-option liq-telegram-btn"
              @click="openDiscordLink">
        Liquality Discord
      </button>
    </div>
  </div>
</template>

<script>
import buildConfig from '../build.config'

export default {
  methods: {
    openDiscordLink () {
      chrome.tabs.create({ url: buildConfig.discordUrl })
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
