<template>
  <div class="splash login-wrapper">
    <div class="splash_logo">
      <Logo />
    </div>
    <div class="splash_tagline">
      <WalletText class="splash_tagline_wallet" />
      <p>The atomic swap enabled <br/>
      multi-crypto wallet</p>
    </div>
    <div>
      <p><router-link to="/open"><button class="btn btn-light btn-lg btn-block btn-icon">Open wallet</button></router-link></p>
      <p><router-link to="/create"><button class="btn btn-light btn-lg btn-block btn-icon">Create a new wallet</button></router-link></p>
      <p class="text-center">Forgot password? Import with seed phrase</p>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import Logo from '@/assets/icons/logo.svg'
import WalletText from '@/assets/icons/wallet_text.svg'

export default {
  components: {
    Logo,
    WalletText
  }
}
</script>

<style lang="scss">
.splash {
  &_logo {
    padding: 40px 0;
  }

  &_tagline {
    margin-bottom: 20px;
    &_wallet {
      margin-bottom: 10px;
    }

    line-height: 28px;
    font-size: 18px;
  }
}
</style>
