<template>
  <div class="wallet-locked login-wrapper">
    <div class="login-header">
      <LogoWallet />
    </div>
    <div>
      <h2>Unlock your wallet</h2>
    </div>
    <div>
      <LockOpenIcon class="wallet-locked_icon" />
    </div>
    <div>
      <p>My wallet</p>
    </div>
    <div class="wallet-locked_bottom">
      <router-link to="/open"><button class="btn btn-light btn-lg btn-block btn-icon">Unlock</button></router-link>
    </div>
  </div>
</template>

<script>
import LogoWallet from '@/assets/icons/logo_wallet.svg'
import LockOpenIcon from '@/assets/icons/lock_open.svg'

export default {
  components: {
    LogoWallet,
    LockOpenIcon
  }
}
</script>

<style lang="scss">
.wallet-locked {
  p {
    font-size: 18px;
  }

  &_bottom {
    margin-bottom: 120px;
  }
}
</style>
