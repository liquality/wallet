<template>
  <div class="backup-wallet login-wrapper no-outer-pad">
    <div class="login-header">
      <LogoWallet />
    </div>
    <div>
      <CompletedIcon class="backup-wallet_icon" />
      <h5>{{ name }}</h5>
      <h2>Backup your wallet</h2>
      <p>Back up your seed phrase in a secure location. It will not be displayed again.</p>
    </div>
    <div class="backup-wallet_bottom">
      <div class="backup-wallet_seed">
        <span v-for="word in seedList" :key="word">{{ word }}</span>
      </div>
      <router-link to="/open"><button class="btn btn-primary btn-lg btn-block btn-icon">Done</button></router-link>
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
  },
  props: ['name', 'seed'],
  computed: {
    seedList: function () {
      return this.seed.split(' ')
    }
  }
}
</script>

<style lang="scss">
.backup-wallet {
  padding: 70px 0 0 0 !important;

  .backup-wallet_bottom {
    flex: 1;
    background: #FFFFFF;
    color: $color-text-primary;
    padding: $wrapper-padding;
  }

  > div {
    padding: 0 $wrapper-padding;
  }

  &_icon {
    width: 40px;
    margin-top: 30px;
    margin-bottom: 10px;
  }

  h2 {
    padding-top: 10px;
  }

  h5 {
    color: $color-text-secondary;
  }

  &_seed {
    font-size: 18px;
    padding-left: 0;
    margin-bottom: 10px;
    text-align: left;
    counter-reset: wordIndex;
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;

    span {
      display: block;
      flex: 0 0 94px;
      padding-bottom: 6px;
      text-align: left;

      &::before {
        display: block;
        font-size: $font-size-tiny;
        counter-increment: wordIndex;
        content: counter(wordIndex);
      }
    }
  }
}
</style>
