<template>
  <div class="swap wrapper">
    <div class="wrapper_top form">
      <div class="form-group">
        <label for="amount" class="balance-label">Send
          <span class="balance-label_balance">3.123456 BTC</span>
          <span class="balance-label_available">Available&nbsp;</span>
        </label>
        <div class="input-group">
          <input type="number" class="form-control" id="amount" placeholder="0.00">
          <div class="input-group-append">
            <span class="input-group-text">BTC</span>
          </div>
        </div>
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
      </div>
      <div class="swap-rate form-group">
        <label>Rate</label>
        <p><span class="swap-rate_base">1 BTC =</span><span class="swap-rate_value">&nbsp;43.856283</span><span class="swap-rate_term">&nbsp;ETH</span></p>
      </div>
    </div>
    <div class="wrapper_bottom">
      <router-link to="/account/btc/swap/confirm"><button class="btn btn-primary btn-lg btn-block">Continue</button></router-link>
    </div>
  </div>
</template>

<script>

export default {
  components: {
  }
}
</script>

<style lang="scss">
.swap {

}
</style>
