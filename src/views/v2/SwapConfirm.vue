<template>
  <div class="swap-confirm wrapper form text-center">
    <div class="wrapper_top form">
      <div class="form-group">
        <label>Pay</label>
        <p class="confirm-value">0.102238 BTC</p>
      </div>
      <div class="form-group">
        <label>Receive</label>
        <p class="confirm-value">56.45621 ETH</p>
      </div>
      <div class="swap-rate form-group">
        <label>Rate</label>
        <p><span class="swap-rate_base">1 BTC =</span><span class="swap-rate_value">&nbsp;43.856283</span><span class="swap-rate_term">&nbsp;ETH</span></p>
      </div>
    </div>
    
    <div class="wrapper_bottom">
      <router-link to="/account/btc"><button class="btn btn-primary btn-lg btn-block btn-icon"><SwapIcon /> Initiate Swap</button></router-link>
    </div>
  </div>
</template>

<script>
import SwapIcon from '@/assets/icons/arrow_swap.svg'

export default {
  components: {
    SwapIcon
  }
}
</script>

<style lang="scss">
.swap-confirm {

}
</style>
