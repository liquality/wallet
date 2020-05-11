<template>
  <div class="send wrapper form">
    <div class="wrapper_top form">
      <div class="form-group">
        <label for="address">Send to</label>
        <div class="input-group">
          <input type="number" class="form-control" id="address" placeholder="Address">
          <div class="input-group-append">
            <span class="input-group-text"><button class="btn btn-outline-primary btn-sm btn-block">Paste</button></span>
          </div>
        </div>
      </div>
      <div class="form-group">
        <label for="amount">Amount
          <span class="send_available">Available</span>
          <span class="send_balance">3.123456 BTC</span>
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
.send {
  .form .input-group-text {
    width: 60px;
  }
}
</style>
