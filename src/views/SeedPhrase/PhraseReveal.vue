<template>
  <div class="backup-wallet login-wrapper no-outer-pad">
    <div class="backup-wallet_top">
      <Eye class="backup-wallet_icon" />
      <h2>Seed Phrase</h2>
      <p>The seed phrase is the only way to restore your wallet. Write it down, verify it and then store it securely.</p>
    </div>
    <div class="backup-wallet_bottom">
      <div class="backup-wallet_seed">
        <span v-for="word in seedList" :key="word">{{ word }}</span>
      </div>
    <div class="bottom-buttons-reveal">
        <router-link to="/wallet"><button class="btn btn-outline-primary btn-lg btn-block button-width">Cancel</button></router-link>
        <router-link to="/wallet"><button class="btn btn-primary btn-lg btn-block button-width">I saved the seed</button></router-link>
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

.bottom-buttons-reveal {
    display: flex;
    flex-direction: row;
    justify-content: space-evenly;
    .button-width {
        width: 150px;
    }
}
.backup-wallet_seed {
    display: flex;
    margin: 0 auto;
    span {
        color: white;
        &::before {
            color: black;
        }
    }
    span:hover {
        color: black;
        transition: ease-in .7s;
        cursor: pointer;
    }
}

</style>
