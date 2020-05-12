<template>
  <div class="send-confirm wrapper form text-center">
    <div class="wrapper_top form">
      <div class="form-group">
        <label>Send</label>
        <p class="confirm-value">0.102238 BTC</p>
      </div>
      <div class="form-group">
        <label>To</label>
        <p class="confirm-value">0x52b205...432daa</p>
      </div>
    </div>
    
    <div class="wrapper_bottom">
      <router-link to="/account/btc"><button class="btn btn-primary btn-lg btn-block btn-icon"><SendIcon /> Send</button></router-link>
    </div>
  </div>
</template>

<script>
import SendIcon from '@/assets/icons/arrow_send.svg'

export default {
  components: {
    SendIcon
  }
}
</script>

<style lang="scss">
.send-confirm {
  .btn.btn-icon svg {
    height: 12px;
  }
}
</style>
