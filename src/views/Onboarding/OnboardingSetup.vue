<template>
<div>
  <OnboardingPassword v-if="currentStep === 'beginning'" @on-unlock="onUnlock"/>
  <div class="backup-wallet login-wrapper no-outer-pad" v-if="currentStep === 'backup'">
    <div class="backup-wallet_top">
      <CompletedIcon class="backup-wallet_icon" />
      <h2 class="p-1">Backup your wallet</h2>
      <p class="m-0">The seed phrase is the only way to restore your wallet. Write it down, verify it and then store it securely.</p>
    </div>
    <div class="backup-wallet_bottom">
      <div class="backup-wallet_seed pt-1">
        <span v-for="word in seedList" :key="word">{{ word }}</span>
      </div>
      <button class="btn btn-primary btn-lg btn-block btn-icon" @click="pushToConfirm">Next</button>
    </div>
  </div>
  <ConfirmSeed v-if="currentStep === 'confirm'" @on-confirm="confirmMnemonic" @on-cancel="currentStep = 'backup'" :mnemonic="mnemonic" />
  <Congratulations v-if="currentStep === 'congrats'" />
</div>
</template>

<script>
import { mapActions } from 'vuex'
import CompletedIcon from '@/assets/icons/completed.svg'
import { generateMnemonic } from 'bip39'
import ConfirmSeed from './SeedPhrase/ConfirmSeed'
import Congratulations from './SeedPhrase/Congratulations.vue'
import OnboardingPassword from './OnboardingPassword'

export default {
  data () {
    return {
      mnemonic: null,
      currentStep: 'beginning',
      password: null
    }
  },
  props: ['passphrase'],
  components: {
    CompletedIcon,
    ConfirmSeed,
    Congratulations,
    OnboardingPassword
  },
  created () {
    if (this.passphrase) {
      this.mnemonic = this.passphrase
    } else {
      this.mnemonic = generateMnemonic()
    }
  },
  computed: {
    seedList: function () {
      return this.mnemonic.split(' ')
    }
  },
  methods: {
    ...mapActions(['setupWallet', 'createWallet', 'unlockWallet']),
    async confirmMnemonic () {
      this.currentStep = 'congrats'
      await this.setupWallet({ key: this.password })
      await this.createWallet({ key: this.password, mnemonic: this.mnemonic }) // mnemonic prop can be null to generate new seed
      setTimeout(() => {
        this.unlockWallet({ key: this.password })
      }, 3500)
    },
    pushToConfirm () {
      this.currentStep = 'confirm'
    },
    async onUnlock (password) {
      this.password = password
      if (this.passphrase) {
        await this.confirmMnemonic()
      } else {
        this.currentStep = 'backup'
      }
    }
  }
}
</script>

<style lang="scss">
.backup-wallet {
  padding: 0 !important;
  overflow: hidden;

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
