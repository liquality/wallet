<template>
  <div class="backup-wallet login-wrapper no-outer-pad">
    <div class="login-header">
      <LogoWallet />
    </div>
    <div>
      <CompletedIcon class="backup-wallet_icon" />
      <p>My wallet</p>
      <h2>Backup your wallet</h2>
      <p>Back up your seed phrase in a secure location. It will not be displayed again.</p>
    </div>
    <div class="backup-wallet_bottom">
      <div class="backup-wallet_seed">
        <span>logic</span><span>resist</span><span>dash</span>
        <span>trigger</span><span>seminar</span><span>monkey</span>
        <span>custom</span><span>afraid</span><span>zoom</span>
        <span>pudding</span><span>enrich</span><span>cage</span>
      </div>
      <router-link to="/locked"><button class="btn btn-primary btn-lg btn-block btn-icon">Done</button></router-link>
    </div>
  </div>
</template>

<script>
import LogoWallet from '@/assets/icons/logo_wallet.svg'
import CompletedIcon from '@/assets/icons/completed.svg'

export default {
  components: {
    LogoWallet,
    CompletedIcon
  }
}
</script>

<style lang="scss">
.backup-wallet {
  padding: 70px 0 0 0 !important;

  .backup-wallet_bottom {
    background: #FFFFFF;
    color: $color-text-primary;
    padding: $wrapper-padding $wrapper-padding 85px $wrapper-padding;
  }

  > div {
    padding: 0 $wrapper-padding;
  }

  &_icon {
    width: 55px;
    margin-bottom: 20px;
    margin-top: 40px;
  }

  h2 {
    padding: 20px 0;
  }

  &_seed {
    font-size: 18px;
    padding-left: 20px;
    margin-bottom: 20px;
    text-align: left;

    span {
      display: inline-block;
      width: 100px;
      text-align: left;
    }
  }
}
</style>
