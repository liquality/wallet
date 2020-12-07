<template>
  <div class="onboading-password login-wrapper">
    <div class="login-header">
      <LogoWallet />
    </div>
    <div>
      <h2>Create Password</h2>
    </div>
    <form class="form" autocomplete="off" v-on:submit.prevent="generate">
      <div class="form-group">
        <label for="password">Choose Password</label>
        <div class="input-group">
          <input type="password" class="form-control" id="password" v-model="password" autocomplete="off" required :readonly="loading">
        </div>
      </div>
      <div class="form-group">
        <label for="confirmPassword">Confirm Password</label>
        <div class="input-group">
          <input type="password" class="form-control" id="confirmPassword" v-model="confirmPassword" autocomplete="off" required :readonly="loading">
        </div>
        <small v-show="passwordMatch" class="form-text hidden" >Passwords don't match.</small>
        <small class="form-text">Password must be at least 8 characters.</small>
      </div>
    </form>
    <div class="login-footer">
      <div class="footer-content">
        <button class="btn btn-light btn-lg btn-footer btn-icon" @click="$router.go(-1)">Cancel</button>
        <button class="btn btn-primary btn-lg btn-footer btn-icon" :disabled="loading || disableNext" @click="next">
          <SpinnerIcon class="btn-loading" v-if="loading" />
          <template v-else>Continue</template>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions } from 'vuex'

import LogoWallet from '@/assets/icons/logo_wallet.svg'
import SpinnerIcon from '@/assets/icons/spinner.svg'

export default {
  data () {
    return {
      password: null,
      confirmPassword: null,
      loading: false
    }
  },
  props: ['mnemonic'],
  components: {
    LogoWallet,
    SpinnerIcon
  },
  computed: {
    passwordMatch () {
      if (!this.password || !this.confirmPassword) return false
      if ((this.password.length === this.confirmPassword.length) && (this.password !== this.confirmPassword)) return true
      return false
    },
    disableNext () {
      if (!this.password || !this.confirmPassword) return true
      if (this.password !== this.confirmPassword) return true
      if (this.password.length < 8) return true

      return false
    }
  },
  methods: {
    ...mapActions(['setupWallet', 'createWallet', 'unlockWallet']),
    async next () {
      this.loading = true
      const newWallet = !this.mnemonic
      await this.setupWallet({ key: this.password })
      await this.createWallet({ key: this.password, mnemonic: this.mnemonic }) // mnemonic prop can be null to generate new seed
      await this.unlockWallet({ key: this.password })
      if (newWallet) {
        this.$router.replace('/backup')
      }
    }
  }
}
</script>

<style lang="scss">

.hidden {
  display:none;
}

.onboading-password {
  padding: 20px;

  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;

  &_header {
    display: flex;
    justify-content: center;
    flex-direction: column;
    align-items: center;
    text-align: center;

    margin-top: 2rem;
  }

  &_input {
    display: flex;
    justify-content: center;
    flex-direction: column;
    align-items: center;
    text-align: center;

    &__userinput {
      text-align: left;

      label {
        font-size: 12px;
        text-transform: uppercase;
        font-weight: 700;
        color: #fff;
      }

      input {
        border-bottom-width: 1px;
        color: #fff;
      }
    }

    &__actions {
      display: flex;
      flex-direction: column;
      width: 100%;
    }
  }
}
</style>
