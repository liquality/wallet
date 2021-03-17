<template>
  <div class="phrase-reveal login-wrapper no-outer-pad">
    <div class="phrase-reveal_top">
      <Eye class="phrase-reveal_icon mt-4" />
      <h2 class="mt-4">Seed Phrase</h2>
      <p class="pb-2 m-0">The seed phrase is the only way to restore your wallet. Write it down, verify it and then store it securely.</p>
    </div>
    <div class="phrase-reveal_bottom">
      <p>Hidden for security.  MouseOver to reveal phrase.</p>
      <div class="phrase-reveal_seed pl-0 mb-1">
        <span v-for="word in seedList" :key="word">{{ word }}</span>
      </div>
    <div class="button-group">
          <router-link to="/wallet"><button class="btn btn-outline-primary btn-lg btn-block">Cancel</button></router-link>
          <router-link to="/wallet"><button class="btn btn-primary btn-lg btn-block">I saved the seed</button></router-link>
    </div>
  </div>
  </div>
</template>

<script>

import { mapState } from 'vuex'
import Eye from '../../assets/icons/eye.svg'

export default {
  components: {
    Eye
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

.phrase-reveal {
  padding: 0 !important;
  overflow: hidden;
  &_top {
    p {
      font-size: 14px;
    }
  }
  &_bottom {
    flex: 1;
    background: #FFFFFF;
    color: $color-text-primary;
    padding: $wrapper-padding;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
  }
  &_icon {
    width: 115px;
  }
  &_seed {
    font-size: 18px;
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
        color: white;
        &::before {
            display: block;
            color: black;
            font-size: $font-size-tiny;
            counter-increment: wordIndex;
            content: counter(wordIndex);
        }
    }
    span:hover {
        color: black;
        transition: ease-in .7s;
        cursor: pointer;
    }
  }
}

</style>
