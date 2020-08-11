<template>
  <div class="backup-wallet login-wrapper no-outer-pad">
    <div class="backup-wallet_top">
      <CompletedIcon class="backup-wallet_icon" />
      <h5>{{ wallet.name }}</h5>
      <h2>Backup your wallet</h2>
      <p>Back up your seed phrase in a secure location. It will not be displayed again.</p>
    </div>
    <div class="backup-wallet_bottom">
      <div class="backup-wallet_seed">
        <span v-for="word in seedList" :key="word">{{ word }}</span>
      </div>
      <router-link to="/wallet"><button class="btn btn-primary btn-lg btn-block btn-icon">Done</button></router-link>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import CompletedIcon from '@/assets/icons/completed.svg'

export default {
  components: {
    CompletedIcon
  },
  computed: {
    ...mapState(['wallets', 'activeWalletId']),
    wallet: function () {
      return this.wallets.find(wallet => wallet.id === this.activeWalletId)
    },
    seedList: function () {
      return this.wallet.mnemonic.split(' ')
    }
  }
}
</script>

<style lang="scss">
.backup-wallet {
  padding: 0 !important;
  overflow: hidden;

  &_top {
  }

  .backup-wallet_bottom {
    flex: 1;
    background: #FFFFFF;
    color: $color-text-primary;
    padding: $wrapper-padding;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
  }

  > div {
    padding: $wrapper-padding;
  }

  &_icon {
    width: 40px;
    margin: 10px 0;
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
    flex: 1;

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
