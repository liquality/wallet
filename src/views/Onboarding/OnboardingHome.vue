<template>
  <div class="onboading-home">
    <div class="onboading-home_header">
      <LogoWallet />
    </div>
    <div class="onboading-home_tnc">
      <h4 class="mb-3 font-weight-normal">Terms &amp; Privacy</h4>
      <div class="onboading-home_tnc__text mb-3">
        Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
      </div>
      <div class="onboading-home_tnc__actions">
        <button class="btn btn-primary btn-lg btn-block mb-2" @click="acceptTnC">I accept</button>
        <button class="btn btn-light btn-border btn-lg btn-block" @click="cancel">Cancel</button>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions } from 'vuex'

import LogoWallet from '@/assets/icons/logo_wallet.svg'

export default {
  components: {
    LogoWallet
  },
  methods: {
    ...mapActions(['proxyMutation']),
    acceptTnC () {
      this.proxyMutation({
        type: 'ACCEPT_TNC'
      })
    },
    cancel () {
      window.close()
    }
  }
}
</script>

<style lang="scss">
.onboading-home {
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
    flex-grow: 1;
  }

  &_tnc {
    display: flex;
    justify-content: center;
    flex-direction: column;
    align-items: center;
    text-align: center;

    margin: -20px;
    padding: 20px;
    background: #fff;

    &__text {
      max-height: 300px;
      overflow-y: auto;
      text-align: left;
    }

    &__actions {
      display: flex;
      flex-direction: column;
      width: 100%;
    }
  }
}
</style>
