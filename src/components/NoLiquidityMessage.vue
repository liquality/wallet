<template>
  <div class="notification-content">
    <div class="notification-text">
      No liquidity for this pair. Request it via
    </div>
    <router-link to="https://t.me/liquality"
                 target="_blank"
                 class="btn btn-option">
      Telegram
    </router-link>
  </div>
</template>

<style lang="scss">
.notification-content {
  display: flex;
  justify-content: space-between;
  align-items: center;

  .notification-text {
    width: 245px;
  }
}
</style>
