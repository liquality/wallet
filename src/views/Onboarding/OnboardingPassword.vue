<template>
  <div class="onboading-password">
    <div class="onboading-password_header mb-5">
      <LogoWallet />
    </div>
    <div class="onboading-password_input">
      <h4 class="mb-5 font-weight-normal text-white">Create Password</h4>
      <div class="onboading-password_input__userinput mb-5">
        <label>Choose password</label>
        <input class="form-control mb-4" v-model="password" :readonly="loading">

        <label>Confirm password</label>
        <input class="form-control" v-model="confirmPassword" :readonly="loading">
      </div>
      <div class="onboading-password_input__actions">
        <button class="btn btn-primary btn-lg btn-block" :disabled="loading || disableNext" @click="next">Continue</button>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions } from 'vuex'

import LogoWallet from '@/assets/icons/logo_wallet.svg'

export default {
  data () {
    return {
      password: null,
      confirmPassword: null,
      loading: false
    }
  },
  components: {
    LogoWallet
  },
  computed: {
    disableNext () {
      if (!this.password || !this.confirmPassword) return true

      if (this.password === this.confirmPassword) return false

      return true
    }
  },
  methods: {
    ...mapActions(['setupWallet']),
    next () {
      this.loading = true
      this.setupWallet({ key: this.password })
    }
  }
}
</script>

<style lang="scss">
.onboading-password {
  padding: 20px;
  background: $brand-gradient-secondary;

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
