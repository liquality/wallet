<template>
  <div class="import-wallet login-wrapper">
    <div class="login-header">
      <LogoWallet />
    </div>
    <div class="import-wallet_top">
      <h2>Import wallet</h2>
      <p>Enter the {{numWords}} word seed phrase saved when creating your wallet in the same order.</p>
    </div>
    <div class="import-wallet_bottom">
      <toggle-button @change="toggleMnemonicLength" color="#9d4dfa"/> {{numWords}} words
      <form class="form import-wallet_seed">
        <div v-for="(e, n) in numWords" :key="n"><input type="text" class="form-control form-control-sm" v-model="wordList[n]" autocomplete="off" required /></div>
      </form>
      <p><button class="btn btn-primary btn-lg btn-block" :disabled="disableNext" @click="next">Continue</button></p>
      <p><button class="btn btn-light btn-outline-primary btn-lg btn-block btn-icon" @click="$router.go(-1)">Cancel</button></p>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import LogoWallet from '@/assets/icons/logo_wallet.svg'

export default {
  components: {
    LogoWallet
  },
  data: function () {
    return {
      wordList: Array(12).fill(''),
      numWords: 12
    }
  },
  updated: function () {
  },
  watch: {
    wordList: function (newList, oldList) {
      var words = newList[0].split(' ')
      if (words.length === this.numWords) {
        for (var m = 0; m < words.length; m++) {
          this.wordList[m] = words[m]
        }
      }
    }
  },
  computed: {
    ...mapState(['wallets', 'activeWalletId']),
    wallet: function () {
      return this.wallets.find(wallet => wallet.id === this.activeWalletId)
    },
    disableNext: function () {
      return this.wordList.filter(word => word === '' || /\s/.test(word)).length > 0 // TODO: this should actually validate bip39
    }
  },
  methods: {
    next () {
      const mnemonic = this.wordList.join(' ')
      this.$router.push({ name: 'OnboardingPassword', params: { mnemonic } })
    },
    toggleMnemonicLength () {
      this.numWords = (this.numWords === 12) ? 24 : 12
      this.wordList = Array(this.numWords).fill('')
    }
  }
}
</script>

<style lang="scss">

.num-words {
  background: $color-text-primary;

}

.import-wallet {
  padding: 50px 0 0 0 !important;
  overflow-y: scroll;

  .import-wallet_top {
    h2 {
      padding-top: 10px;
      margin-bottom: 10px;
    }
  }

  .import-wallet_bottom {
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

  h5 {
    color: $color-text-secondary;
  }

  &_seed.form {
    font-size: 18px;
    padding-left: 0;
    margin-bottom: 10px;
    text-align: left;
    counter-reset: wordIndex;
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;

    div {
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

      input {
        color: $color-text-primary;
      }
    }
  }
}
</style>
