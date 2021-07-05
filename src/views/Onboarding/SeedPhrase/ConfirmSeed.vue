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
                            <input type="text" class="form-control text-center w-75 mx-auto form-control-sm" id="1st_word" v-model="phraseIndex[0]" @click="remove(0)" autocomplete="off" required />
                        </div>
                        <div>
                            <label>5<sup>th</sup> Word</label>
                            <input type="text" class="form-control text-center w-75 mx-auto form-control-sm" id="5th_word" v-model="phraseIndex[1]" @click="remove(1)" autocomplete="off" required />
                        </div>
                        <div>
                            <label>12<sup>th</sup> Word</label>
                            <input type="text" class="form-control text-center w-75 mx-auto form-control-sm" id="12th_word" v-model="phraseIndex[2]" @click="remove(2)" autocomplete="off" required />
                        </div>
                    </div>
                </form>
                </div>
                <div class="confirm-seed_selections mt-4 mb-3 px-1 mx-auto">
                    <div class="confirm-seed_options flex-container d-flex flex-wrap justify-content-around px-1">
                        <button class="btn button-confirm px-1 py-0 mx-1 my-3" v-for="(word, i) in seedListShuffle" id="seed_word" :disabled="indexDisabled(i)" :key="word" @click="onSelect(word)">{{ word }}</button>
                    </div>
                </div>
            </div>
        </div>
        <div class="footer-container bg-white px-2 pt-2">
            <div class="button-group px-2">
                <button class="btn btn-outline-primary btn-lg" @click="cancel">Back</button>
                <button class="btn btn-primary btn-lg" id="seed_phrase_continue" :disabled="!isConfirmedMatch" @click="onConfirm">Continue</button>
            </div>
    </div>
    </div>
</template>

<script>

import LogoWallet from '@/assets/icons/logo_wallet.svg?inline'

export default {
  data () {
    return {
      phraseIndex: [],
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
      return this.seedList[0] === this.phraseIndex[0] && this.seedList[4] === this.phraseIndex[1] && this.seedList[11] === this.phraseIndex[2]
    }
  },
  methods: {
    onSelect (word) {
      this.phraseIndex.push(word)
    },
    onConfirm () {
      this.$emit('on-confirm')
    },
    cancel () {
      this.$emit('on-cancel')
    },
    indexDisabled (i) {
      return this.seedListShuffle[i] === this.phraseIndex[0] || this.seedListShuffle[i] === this.phraseIndex[1] || this.seedListShuffle[i] === this.phraseIndex[2] || this.phraseIndex.length === 3
    },
    remove: function (i) {
      this.phraseIndex.splice(i, 1)
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
      font-weight: 600;
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
