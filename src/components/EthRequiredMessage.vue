<template>
  <div class="notification-content">
    <div class="notification-text">
      A balance is required to swap and you need ETH to pay for gas.
    </div>
    <router-link to="/account/ETH/receive"
                 class="btn btn-option get-eth-btn">
      Get ETH
    </router-link>
  </div>
</template>

<style lang="scss" scoped>
.notification-content {
  display: flex;
  justify-content: space-between;
  align-items: center;

  .get-eth-btn {
    width: 68px;
  }
  .notification-text {
    width: 250px;
  }
}
</style>
