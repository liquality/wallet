<template>
  <div class="swap wrapper">
    <div class="wrapper_top form">
      <div class="form-group">
        <label for="amount">Send
          <span class="swap_available">Available</span>
          <span class="swap_balance">3.123456 BTC</span>
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
      <div class="swap_rate form-group">
        <label for="amount">Rate</label>
        <div class="input-group">
          <span class="swap_rate_base">1 BTC =</span>
          <span class="swap_rate_value">43.856283</span>
          <span class="swap_rate_term">ETH</span>
        </div>
      </div>
    </div>
    <div class="wrapper_bottom">
      <button class='btn btn-primary btn-lg btn-block'>Continue</button>
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
