<template>
  <div v-if="isPairAvailable" class="notification-content">
    <div>
      {{ $t('components.noLiquidityMessage.noLiquidity', { asset }) }}
      <a href="https://discord.com/invite/5mgYtuArkh" target="_blank"> discord </a>
      {{ $t('components.noLiquidityMessage.tryAgainLater') }}
    </div>
  </div>
  <div v-else class="notification-content">
    <div>
      {{ $t('components.noLiquidityMessage.noTraded') }}
    </div>
  </div>
</template>

<script>
export default {
  props: {
    isPairAvailable: Boolean,
    asset: String
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
