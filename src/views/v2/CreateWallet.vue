<template>
  <div class="create-wallet login-wrapper">
    <div class="login-header">
      <LogoWallet />
    </div>
    <div>
      <h2>Create your wallet</h2>
    </div>
    <div class="form">
      <div class="form-group">
        <label for="name">Wallet Name</label>
        <div class="input-group">
          <input type="text" class="form-control" id="name" placeholder="">
        </div>
      </div>
      <div class="form-group">
        <label for="password">Password</label>
        <div class="input-group">
          <input type="password" class="form-control" id="password" placeholder="">
        </div>
        <small class="form-text">You need this password to unlock your wallet.</small>
      </div>
    </div>
    <div>
      <p><router-link to="/backup"><button class="btn btn-light btn-lg btn-block btn-icon">Generate seed phrase</button></router-link></p>
      <p><router-link to="/"><button class="btn btn-primary btn-lg btn-block btn-icon">Cancel</button></router-link></p>
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
.create-wallet {

}
</style>
