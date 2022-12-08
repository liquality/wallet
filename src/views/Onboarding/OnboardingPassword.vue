<template>
  <div class="onboading-password login-wrapper">
    <div class="login-header">
      <LogoWallet />
    </div>
    <div>
      <h2>
        {{ $t('common.create') }} {{ !imported ? $t('common.new') : '' }}
        {{ $t('common.password') }}
      </h2>
    </div>
    <form class="form" autocomplete="off" v-on:submit.prevent="generate">
      <div class="form-group mb-4">
        <label for="password">{{ $t('pages.onboarding.setup.choosePassword') }}</label>
        <div class="input-group">
          <input
            type="password"
            class="form-control"
            id="password"
            v-model="password"
            autocomplete="off"
            @blur="validatePasswordLength"
            required
          />
        </div>
        <small
          v-show="showPasswordLengthError && validatePasswordLength"
          class="onboading-password_errorLength form-text hidden"
          >{{ $t('pages.onboarding.setup.passwordTooShort') }}</small
        >
      </div>
      <div class="form-group">
        <label for="confirmPassword">{{ $t('pages.onboarding.setup.confirmPassword') }}</label>
        <div class="input-group">
          <input
            type="password"
            class="form-control"
            id="confirmPassword"
            v-model="confirmPassword"
            autocomplete="off"
            required
          />
        </div>
        <small
          v-show="!passwordMatch"
          class="onboading-password_errorLength form-text hidden"
          id="password_match_error"
          >{{ $t('pages.onboarding.setup.passwordDontMatch') }}</small
        >
      </div>
    </form>
    <div class="footer-container">
      <div class="footer-content">
        <button class="btn btn-light btn-lg btn-footer btn-icon" @click="$emit('on-cancel')">
          {{ $t('common.cancel') }}
        </button>
        <button
          class="btn btn-primary btn-lg btn-footer btn-icon"
          id="next_button"
          :disabled="disableNext"
          @click="next"
        >
          {{ $t('common.continue') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import LogoWallet from '@/assets/icons/logo_wallet.svg'

export default {
  props: ['imported'],
  data() {
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
    passwordMatch() {
      if (!this.password || !this.confirmPassword) return true
      if (this.password !== this.confirmPassword) return false
      return true
    },
    disableNext() {
      if (!this.password || !this.confirmPassword) return true
      if (this.password !== this.confirmPassword) return true
      if (this.password.length < 8) return true

      return false
    }
  },
  methods: {
    next() {
      this.$emit('on-unlock', this.password)
    },
    validatePasswordLength() {
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
  display: none;
}

.onboading-password {
  padding: 20px;
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
        font-weight: 600;
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
