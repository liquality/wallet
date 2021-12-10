<template>
  <div class="onboading-password login-wrapper">
    <div class="login-header">
      <LogoWallet />
    </div>
    <div>
      <h2>Create {{!imported ? 'New' : ''}} Password</h2>
    </div>
    <form class="form" autocomplete="off" v-on:submit.prevent="generate">
      <div class="form-group mb-4">
        <label for="password">Choose Password ( at least 8 characters )</label>
        <div class="input-group">
          <input type="password" class="form-control" id="password" v-model="password" autocomplete="off" @blur="validatePasswordLength" required>
        </div>
        <small v-show="showPasswordLengthError && validatePasswordLength" class="onboading-password_errorLength form-text hidden">Password must be at least 8 characters.</small>
      </div>
      <div class="form-group">
        <label for="confirmPassword">Confirm Password</label>
        <div class="input-group">
          <input type="password" class="form-control" id="confirmPassword" v-model="confirmPassword" autocomplete="off" required>
        </div>
        <small v-show="passwordMatch" class="onboading-password_errorLength form-text hidden" id="password_match_error">Passwords don't match.</small>
      </div>
    </form>
    <div class="footer-container">
      <div class="footer-content">
        <button class="btn btn-light btn-lg btn-footer btn-icon" @click="$emit('currentStep')">Cancel</button>
        <button class="btn btn-primary btn-lg btn-footer btn-icon" id="next_button" :disabled="disableNext" @click="next">
          Continue
        </button>
      </div>
    </div>
  </div>
</template>

<script>

import LogoWallet from '@/assets/icons/logo_wallet.svg'

export default {
  props: ['imported'],
  data () {
    return {
      password: null,
      confirmPassword: null,
      showPasswordLengthError: false
    }
  },
  components: {
    LogoWallet
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
    next () {
      this.$emit('on-unlock', this.password)
    },
    validatePasswordLength () {
      if (this.password?.length < 8) {
        this.showPasswordLengthError = true
        return false
      }
      this.showPasswordLengthError = false
      return true
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

  &_errorLength {
    background: $color-text-secondary;
    border-top: 2px solid $danger;
    color: $danger;
    padding: 4px;
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
