<template>
  <div class="login-wrapper confirm-seed h-100 no-outer-pad">
    <div class="confirm-seed_logo-wrap mt-5 mb-3 mx-auto">
      <img :src="logo" />
    </div>
    <div class="confirm-seed_top">
      <h2>{{ $t('pages.onboarding.setup.confirmSeedTitle') }}</h2>
      <p class="px-3">
        {{ $t('pages.onboarding.setup.confirmSeedInstructions') }}
      </p>
    </div>
    <div class="confirm-seed_bottom">
      <div class="confirm-seed_bottom-top">
        <div class="mx-auto mt-3">
          <form class="form">
            <div class="confirm-seed_inputs d-flex flex-row justify-content-around">
              <div>
                <label
                  >1<sup>{{ $t('pages.onboarding.setup.ordinals.first') }}</sup>
                  {{ $t('pages.onboarding.setup.word') }}
                </label>
                <input
                  type="text"
                  class="form-control text-center w-75 mx-auto form-control-sm"
                  id="first_seed_word_input"
                  v-model="phraseIndex[0]"
                  @click="remove(0)"
                  autocomplete="off"
                  required
                />
              </div>
              <div>
                <label
                  >5<sup>{{ $t('pages.onboarding.setup.ordinals.fifth') }}</sup>
                  {{ $t('pages.onboarding.setup.word') }}
                </label>
                <input
                  type="text"
                  class="form-control text-center w-75 mx-auto form-control-sm"
                  id="fifth_seed_word_input"
                  v-model="phraseIndex[1]"
                  @click="remove(1)"
                  autocomplete="off"
                  required
                />
              </div>
              <div>
                <label
                  >12<sup>{{ $t('pages.onboarding.setup.ordinals.twelfth') }}</sup>
                  {{ $t('pages.onboarding.setup.word') }}
                </label>
                <input
                  type="text"
                  class="form-control text-center w-75 mx-auto form-control-sm"
                  id="twelveWord_seed_word_input"
                  v-model="phraseIndex[2]"
                  @click="remove(2)"
                  autocomplete="off"
                  required
                />
              </div>
            </div>
          </form>
        </div>
        <div class="confirm-seed_selections mt-4 mb-3 px-1 mx-auto">
          <div
            class="confirm-seed_options flex-container d-flex flex-wrap justify-content-around px-1"
          >
            <button
              class="btn button-confirm px-1 py-0 mx-1 my-3"
              v-for="(word, i) in seedListShuffle"
              id="seed_word"
              :disabled="indexDisabled(i)"
              :key="i"
              @click="onSelect(word, i)"
            >
              {{ word }}
            </button>
          </div>
        </div>
      </div>
    </div>
    <div class="footer-container bg-white px-2 pt-2">
      <div class="button-group px-2">
        <button class="btn btn-outline-primary btn-lg" @click="cancel">
          {{ $t('common.back') }}
        </button>
        <button
          class="btn btn-primary btn-lg"
          id="seed_phrase_continue"
          :disabled="!isConfirmedMatch"
          @click="onConfirm"
        >
          {{ $t('common.continue') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import LogoWallet from '@/assets/icons/logo_wallet.svg?inline'

export default {
  data() {
    return {
      phraseIndex: [],
      seedListShuffle: [],
      disabledIndexes: [],
      showCongrats: false
    }
  },
  created() {
    this.seedListShuffle = [...this.seedList].sort(() => Math.random() - 0.5)
  },
  props: ['confirm', 'mnemonic'],
  computed: {
    logo() {
      return LogoWallet
    },
    seedList: function () {
      return this.mnemonic.split(' ')
    },
    isConfirmedMatch() {
      return (
        this.seedList[0] === this.phraseIndex[0] &&
        this.seedList[4] === this.phraseIndex[1] &&
        this.seedList[11] === this.phraseIndex[2]
      )
    }
  },
  methods: {
    onSelect(word, i) {
      this.phraseIndex.push(word)
      this.disabledIndexes.push(i)
    },
    onConfirm() {
      this.$emit('on-confirm')
    },
    cancel() {
      this.$emit('on-cancel')
    },
    indexDisabled(i) {
      return this.disabledIndexes.includes(i) || this.disabledIndexes.length === 3
    },
    remove: function (i) {
      this.phraseIndex.splice(i, 1)
      this.disabledIndexes.splice(i, 1)
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
