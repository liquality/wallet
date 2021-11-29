<template>
  <div class="phrase-reveal login-wrapper no-outer-pad">
    <div class="phrase-reveal_top">
      <Eye class="phrase-reveal_icon mt-4" />
      <h2 class="mt-2">Your Seed Phrase</h2>
      <h5 class="phrase-reveal_description pb-2 px-3">The seed phrase is the only way to restore your wallet. Write it down, verify it and then store it securely.</h5>
    </div>
    <div class="phrase-reveal_bottom">
      <p class="phrase-reveal_mouseText">Hidden for security.  Mouse-Over to reveal phrase.</p>
      <div class="phrase-reveal_seed pl-0 mb-1">
        <span v-for="word in seedList" id="seed_word_mouse_hover" :key="word">{{ word }}</span>
      </div>
      <div class="button-group">
        <router-link to="/wallet"><button class="btn btn-outline-primary btn-lg btn-block" id="cancel_button">Cancel</button></router-link>
        <router-link to="/wallet"><button class="btn btn-primary btn-lg btn-block" id="i_saved_the_seed">I saved the seed</button></router-link>
      </div>
    </div>
  </div>
</template>

<script>

import { mapState } from 'vuex'
import Eye from '../../../assets/icons/eye.svg'

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
  &_mouseText {
    font-weight: 600;
  }
  &_description {
    font-weight: 500;
  }
  &_top {
    h5 {
      color: $color-text-secondary;
    }
  }
  &_bottom {
    flex: 1;
    background: $color-text-secondary;
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
        color: $color-text-secondary;
        &::before {
            display: block;
            color: $color-text-primary;
            font-size: $font-size-tiny;
            counter-increment: wordIndex;
            content: counter(wordIndex);
            font-weight: 700;
        }
    }
    span:hover {
        color: $color-text-primary;
        transition: ease-in .7s;
        cursor: pointer;
        font-weight: 700;
    }
  }
}

</style>
