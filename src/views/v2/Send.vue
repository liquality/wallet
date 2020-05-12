<template>
  <div class="send wrapper form">
    <div class="wrapper_top form">
      <div class="form-group">
        <label for="address">Send to</label>
        <div class="input-group">
          <input type="text" class="form-control" id="address" placeholder="Address">
          <div class="input-group-append">
            <span class="input-group-text"><button class="btn btn-outline-primary btn-sm btn-block">Paste</button></span>
          </div>
        </div>
      </div>
      <div class="form-group">
        <label for="amount" class="balance-label">Amount
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
    </div>
    
    <div class="wrapper_bottom">
      <router-link to="/account/btc/send/confirm"><button class="btn btn-primary btn-lg btn-block">Continue</button></router-link>
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
.send {
  .form .input-group-text {
    width: 60px;
  }
}
</style>
