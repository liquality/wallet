<template>
  <div  v-if='isPairAvailable' class="notification-content">
    <div>Liquidity low, please try again later.</div>
  </div>
  <div v-else class="notification-content">
    <div>Pair not supported. Coming Soon!</div>
  </div>
</template>

<script>
import buildConfig from '../build.config'

export default {
  methods: {
    openDiscordLink () {
      chrome.tabs.create({ url: buildConfig.discordUrl })
    }
  },
  props: {
    isPairAvailable: Boolean
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
