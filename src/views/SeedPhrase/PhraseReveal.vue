<template>
    <div class="login-wrapper no-outer-pad">
        <div class="eye-wrap">
            <Eye />
        </div>
        <div class="middle-text-reveal">
            <h2>Your Seed Phrase</h2>
            <h4>The seed phrase is the only way to restore your wallet.  Verify it and ensure it's stored securely'</h4>
        </div>
        <div class="bottom-box-reveal">
            <h5>Hidden for security.  MouseOver to reveal seed phrase</h5>
        </div>
        <div class="phrase-wrap">
            <div class="reveal-seed">
                <span v-for="word in seedList" :key="word">{{ word }}</span>
            </div>
        </div>
        <div class="bottom-buttons">
            <router-link to="/wallet"><button class="btn btn-outline-primary btn-lg cancel-button">Cancel</button></router-link>
            <router-link to="/wallet"><button class="btn btn-primary btn-lg continue-button">I saved the seed</button></router-link>
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

.eye-wrap {
    height: 60px;
    width: 115px;
    position: absolute;
    left: 31.94%;
    right: 31.94%;
    top: 10%;
    bottom: 78.1%;
}
.middle-text-reveal {
    h2 {
        position: absolute;
        width: 360px;
        height: 24px;
        left: 15%;
        top: 166px;

        font-family: Montserrat;
        font-style: normal;
        font-weight: normal;
        font-size: 28px;
        line-height: 24px;
        /* identical to box height, or 86% */

        display: flex;
        align-items: center;
        text-align: center;
        letter-spacing: -0.08px;

        color: #FFFFFF;
    }
    h4 {
        position: absolute;
        left: 5.56%;
        right: 5.56%;
        top: 34.17%;
        bottom: 54.83%;

        font-family: Montserrat;
        font-style: normal;
        font-weight: 600;
        font-size: 14px;
        line-height: 24px;
        /* or 171% */

        text-align: center;

        color: #FFFFFF;
    }
}
.bottom-box-reveal {
    height: 300px;
    width: 500px;
    position: absolute;
    left: 0px;
    bottom: 0px;
    background: white;
    h5 {
        position: absolute;
        top: 3.5%;
        left: 4.75%;
        text-align: center;
        font-family: Montserrat;
        font-style: normal;
        font-weight: 500;
        font-size: 12px;
        line-height: 16px;
        /* or 133% */
        color: #1D1E21;
    }
}
.phrase-wrap {
    position: absolute;
    bottom: 8.75%;
}
.reveal-seed {
    font-size: 18px;
    color: black;
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
        color: white;
        flex: 0 0 94px;
        padding-bottom: 6px;
        text-align: left;

      &::before {
        display: block;
        color: black;
        font-size: $font-size-tiny;
        counter-increment: wordIndex;
        content: counter(wordIndex);
      }
    }
    span:hover {
        cursor: pointer;
        color: black;
        transition: ease-in 1s;
    }
}

</style>
