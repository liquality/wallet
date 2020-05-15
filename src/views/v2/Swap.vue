<template>
  <div class="swap wrapper">
    <div class="wrapper_top form">
      <div class="form-group">
        <label for="amount">Send</label>
        <div class="input-group">
          <input type="number" class="form-control" id="amount" placeholder="0.00">
          <div class="input-group-append">
            <span class="input-group-text">BTC</span>
          </div>
        </div>
        <small class="form-text d-flex justify-content-between">
          <div class="swap_limits">
            <a href="#">Min</a> 0.00002 <a class="ml-1" href="#">Max</a> 0.598382
          </div>
          <div class="text-right">
            <span class="text-muted">Balance&nbsp;</span>
            <span>3.123456 BTC</span>
          </div>
        </small>
      </div>
      <div class="form-group">
        <label for="amount">Receive</label>
        <div class="input-group">
          <input type="number" class="form-control" id="amount" placeholder="0.00">
          <div class="input-group-append">
            <span class="input-group-text">
              <select class="custom-select">
                <option>ETH</option>
                <option>DAI</option>
                <option>USDC</option>
              </select>
            </span>
          </div>
        </div>
        <small class="form-text d-flex justify-content-between">
          <div class="swap_limits">
            <a href="#">+ Receive at external address</a>
          </div>
        </small>

      </div>
      <div class="form-group">
        <label class="w-100" for="amount">Receive at <a href="#" class="text-muted float-right">X</a></label>
        <div class="input-group">
          <div class="input-group">
            <input type="text" class="form-control form-control-sm" id="to" placeholder="External Receiving Address">
          </div>
        </div>
      </div>

      <div class="swap_rate form-group">
        <label>Rate</label>
        <p><span class="swap-rate_base">1 BTC =</span><span class="swap-rate_value">&nbsp;43.856283</span><span class="swap-rate_term">&nbsp;ETH</span></p>
      </div>
    </div>
    <div class="wrapper_bottom">
      <SwapInfo />
      <router-link to="/account/btc/swap/confirm"><button class="btn btn-primary btn-lg btn-block">Review Terms</button></router-link>
    </div>
  </div>
</template>

<script>
import SwapInfo from '@/components/v2/SwapInfo'

export default {
  components: {
    SwapInfo
  }
}
</script>

<style lang="scss">
.swap {
  
}
</style>
