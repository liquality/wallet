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
                <div class="mx-auto mt-3">
                <form class="form">
                    <div class="confirm-seed_inputs d-flex flex-row justify-content-around">
                        <div>
                            <label>1<sup>st</sup> Word</label>
                            <input type="text" class="form-control text-center w-75 mx-auto form-control-sm" v-model="phraseSnip[0]" autocomplete="off" required />
                        </div>
                        <div>
                            <label>5<sup>th</sup> Word</label>
                            <input type="text" class="form-control text-center w-75 mx-auto form-control-sm" v-model="phraseSnip[1]" autocomplete="off" required />
                        </div>
                        <div>
                            <label>12<sup>th</sup> Word</label>
                            <input type="text" class="form-control text-center w-75 mx-auto form-control-sm" v-model="phraseSnip[2]" autocomplete="off" required />
                        </div>
                    </div>
                </form>
                </div>
                <div class="confirm-seed_selections mt-4 mb-3 px-1 mx-auto">
                    <div class="confirm-seed_options flex-container d-flex flex-wrap justify-content-around px-1">
                        <button class="btn button-confirm px-1 py-0 mx-1 my-3" v-for="(word, i) in seedListShuffle" :disabled="phraseIndex[i]" :key="word" @click="onSelect(word, i)">{{ word }}</button>
                    </div>
                </div>
            </div>
        </div>
        <div class="footer-container bg-white px-2 pt-2">
            <div class="button-group">
                <button class="btn btn-outline-primary btn-lg" @click="cancel">Back</button>
                <button class="btn btn-primary btn-lg" :disabled="!isConfirmedMatch" @click="onConfirm">Continue</button>
            </div>
    </div>
    </div>
</template>

<script>

import LogoWallet from '@/assets/icons/logo_wallet.svg?inline'

export default {
  data () {
    return {
      phraseSnip: [],
      phraseIndex: {},
      seedListShuffle: [],
      showCongrats: false
    }
  },
  created () {
    this.seedListShuffle = [...this.seedList].sort(() => Math.random() - 0.5)
  },
  props: ['confirm', 'mnemonic'],
  computed: {
    logo () {
      return LogoWallet
    },
    seedList: function () {
      return this.mnemonic.split(' ')
    },
    isConfirmedMatch () {
      return this.seedList[0] === this.phraseSnip[0] && this.seedList[4] === this.phraseSnip[1] && this.seedList[11] === this.phraseSnip[2]
    }
  },
  methods: {
    onSelect (word, i) {
      this.phraseSnip.push(word)
      this.phraseIndex[i] = word
    },
    onConfirm () {
      this.$emit('on-confirm')
    },
    cancel () {
      this.$emit('on-cancel')
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
