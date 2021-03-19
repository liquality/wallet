<template>

    <div class="login-wrapper confirm-seed h-100 no-outer-pad">
        <div class="confirm-seed_logo-wrap mt-5 mb-3 mx-auto">
            <img :src="logo"/>
        </div>
        <div class="confirm-seed_top">
            <h2>Confirm Seed Phrase</h2>
            <p class="px-3">Tap the 3 words matching their position in the seed phrase.  Once confirmed, store the phrase securely.</p>
        </div>
        <div class="confirm-seed_bottom">
            <div class="confirm-seed_bottom-top">
                <div class="mx-auto mt-2">
                <form class="form">
                    <div class="confirm-seed_inputs d-flex flex-row justify-content-around">
                        <div>
                            <label>1<sub>st</sub> Word</label>
                            <input type="text" class="form-control text-center w-75 mx-auto form-control-sm" v-model="phraseSnip[0]" autocomplete="off" required />
                        </div>
                        <div>
                            <label>5<sub>th</sub> Word</label>
                            <input type="text" class="form-control text-center w-75 mx-auto form-control-sm" v-model="phraseSnip[1]" autocomplete="off" required />
                        </div>
                        <div>
                            <label>12<sub>th</sub> Word</label>
                            <input type="text" class="form-control text-center w-75 mx-auto form-control-sm" v-model="phraseSnip[2]" autocomplete="off" required />
                        </div>
                    </div>
                </form>
                </div>
                <div class="confirm-seed_selections mt-3 px-1 mx-auto">
                    <div class="confirm-seed_options flex-container d-flex flex-wrap justify-content-around px-1">
                        <button class="btn button-confirm px-1 mx-1 my-2" v-for="(word, i) in seedList" :disabled="phraseIndex[i]" :key="word" @click="onSelect(word, i)">{{ word }}</button>
                    </div>
                </div>
            </div>
        </div>
        <div class="footer-container bg-white px-2">
            <div class="button-group">
                <router-link to="/backup"><button class="btn btn-outline-primary btn-lg btn-block">Back</button></router-link>
                <router-link to="/congratulations"><button class="btn btn-primary btn-lg btn-block" :disabled="!isConfirmedMatch">Continue</button></router-link>
            </div>
    </div>
    </div>

</template>

<script>

import { mapState } from 'vuex'
import LogoWallet from '@/assets/icons/logo_wallet.svg?inline'

export default {
  data () {
    return {
      phraseSnip: [],
      phraseIndex: {}
    }
  },
  computed: {
    logo () {
      return LogoWallet
    },
    ...mapState(['wallets', 'activeWalletId']),
    wallet: function () {
      return this.wallets.find(wallet => wallet.id === this.activeWalletId)
    },
    seedList: function () {
      return this.wallet.mnemonic.split(' ')
    },
    isConfirmedMatch () {
      return this.seedList[0] === this.phraseSnip[0] && this.seedList[4] === this.phraseSnip[1] && this.seedList[11] === this.phraseSnip[2]
    }
  },
  methods: {
    onSelect (word, i) {
        this.phraseSnip.push(word)
        this.phraseIndex[i] = word
      }
    }
}

</script>

<style lang="scss">
.confirm-seed {
    padding: 0 !important;
    overflow: hidden;
  &_logo-wrap {
    height: 100px;
    width: 100px;
  }
  &_bottom {
    background: $color-text-secondary;
    overflow-y: auto;
  }
  &_bottom-top {
      overflow-x: hidden;
  }
  &_inputs {
      div {
          label {
              color: $color-text-primary;
          }
          input {
              color: $color-text-primary !important;
          }
      }
  }
  &_selections {
    font-size: 12px;
    button {
      color: $color-primary;
      width: 75px;
      background: $color-text-secondary;
      border: 1px solid $hr-border-color;
      border-radius: 26px;
      &:disabled {
        color: $hr-border-color;
      }
      &:focus {
        box-shadow: none;
    }
    }
  }
}
</style>
