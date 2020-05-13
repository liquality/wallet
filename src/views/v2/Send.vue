<template>
  <div class="send wrapper form">
    <div class="wrapper_top form">
      <div class="form-group">
        <label for="address">Send to</label>
        <div class="input-group">
          <input type="text" class="form-control form-control-sm" id="address" placeholder="Address">
        </div>
      </div>
      <div class="form-group">
        <label for="amount">Amount</label>
        <div class="input-group">
          <input type="number" class="form-control" id="amount" placeholder="0.00">
          <div class="input-group-append">
            <span class="input-group-text">BTC</span>
          </div>
        </div>
        <small class="form-text d-flex">
          <div class="text-right w-100">
            <span class="text-muted">Balance&nbsp;</span>
            <span>3.123456 BTC</span>
          </div>
        </small>
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

}
</style>
