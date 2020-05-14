<template>
  <div class="unlock-wallet login-wrapper">
    <div class="login-header">
      <LogoWallet />
    </div>
    <div>
      <h2>Open your wallet</h2>
    </div>
    <div>
      <div class="form">
        <div class="form-group">
          <label for="password">Password</label>
          <div class="input-group">
            <input type="password" class="form-control" id="password" placeholder="">
          </div>
        </div>
      </div>
      <p><router-link to="/wallet"><button class="btn btn-light btn-lg btn-block btn-icon">Unlock</button></router-link></p>
      <p><router-link to="/locked"><button class="btn btn-primary btn-lg btn-block btn-icon">Cancel</button></router-link></p>
      <p>Forgot password? Import with seed phrase</p>
    </div>
  </div>
</template>

<script>
import LogoWallet from '@/assets/icons/logo_wallet.svg'

export default {
  components: {
    LogoWallet
  }
}
</script>

<style lang="scss">
.unlock-wallet {
  .form {

  }
}
</style>
