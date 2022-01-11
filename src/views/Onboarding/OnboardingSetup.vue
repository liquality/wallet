<template>
<div>
  <div class="backup-wallet login-wrapper no-outer-pad" v-show="currentStep === 'backup'">
    <div class="backup-wallet_logo-wrap mx-auto">
        <img :src="logo"/>
    </div>
    <div class="backup-wallet_top">
      <h2 class="p-1">Backup your Wallet</h2>
      <p class="mb-3 backup-wallet_description">The seed phrase is the only way to restore your wallet. Write it down, verify it and then store it securely.</p>
    </div>
    <div class="backup-wallet_bottom">
      <div class="backup-wallet_seed pt-1" id="backup-wallet_seed_wordlist">
        <span v-for="word in seedList" :key="word" id="backup_seed_word">{{ word }}</span>
      </div>
      <div class="footer-container">
        <div class="footer-content">
          <button class="btn btn-outline-primary btn-lg btn-footer btn-icon" @click="$router.go(-1)">Cancel</button>
          <button class="btn btn-primary btn-lg btn-footer btn-icon" id="backup_your_wallet_next_button" @click="pushToConfirm">Next</button>
        </div>
      </div>
    </div>
  </div>
  <ConfirmSeed v-show="currentStep === 'confirm'" @on-confirm="currentStep='password'" @on-cancel="currentStep = 'backup'" :mnemonic="mnemonic" />
  <OnboardingPassword v-show="currentStep === 'password'" :imported="imported" @on-unlock="onUnlock" @currentStep="currentStep='confirm'"/>
  <Congratulations v-show="currentStep === 'congrats'" />
</div>
</template>

<script>
import { mapActions } from 'vuex'
import { generateMnemonic } from 'bip39'
import ConfirmSeed from './SeedPhrase/ConfirmSeed'
import Congratulations from './SeedPhrase/Congratulations.vue'
import OnboardingPassword from './OnboardingPassword'
import LogoWallet from '@/assets/icons/logo_wallet.svg?inline'

export default {
  data () {
    return {
      mnemonic: null,
      currentStep: '',
      password: null,
      imported: false
    }
  },
  props: ['seedphrase'],
  components: {
    ConfirmSeed,
    Congratulations,
    OnboardingPassword
  },
  created () {
    if (this.seedphrase) {
      this.mnemonic = this.seedphrase
      this.imported = true
      this.currentStep = 'password'
    } else {
      this.mnemonic = generateMnemonic()
      this.currentStep = 'backup'
    }
  },
  computed: {
    seedList: function () {
      return this.mnemonic.split(' ')
    },
    logo () {
      return LogoWallet
    }
  },
  methods: {
    ...mapActions(['setupWallet', 'createWallet', 'unlockWallet']),
    async confirmMnemonic () {
      this.currentStep = 'congrats'
      await this.setupWallet({ key: this.password })
      await this.createWallet({
        key: this.password,
        mnemonic: this.mnemonic,
        imported: this.imported
      }) // mnemonic prop can be null to generate new seed
      setTimeout(() => {
        this.unlockWallet({ key: this.password })
      }, 1650)
    },
    pushToConfirm () {
      this.currentStep = 'confirm'
    },
    async onUnlock (password) {
      this.password = password
      await this.confirmMnemonic()
    }
  }
}
</script>

<style lang="scss">
.backup-wallet {
  padding: 0 !important;
  overflow: hidden;

  &_description {
    font-weight: 100;
    font-size: 14px;
  }

  &_logo-wrap {
    margin: 0 auto;
    margin-top: 20px;
  }

  .backup-wallet_bottom {
    flex: 1;
    background: $color-text-secondary;
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
      font-weight: 700;

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
