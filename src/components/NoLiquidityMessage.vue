<template>
  <div v-if="isPairAvailable" class="notification-content">
    <div>
      Not enough liquidity for this trade. You can request {{ asset }} in
      <a href="https://discord.com/invite/5mgYtuArkh" target="_blank">discord </a>
      or try again later.
    </div>
  </div>
  <div v-else class="notification-content">
    <div>
      This pair isn't traded yet. Maybe there is a way to do multiple swaps to get that desired
      token.
    </div>
  </div>
</template>

<script>
export default {
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
