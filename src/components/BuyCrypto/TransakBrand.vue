<template>
  <div>
    <div class="message">powered by</div>
    <img :src="logo" class="logo" />
  </div>
</template>

<script>
import TransakLogo from '@/assets/icons/transak-logo.png'
export default {
  computed: {
    logo() {
      return TransakLogo
    }
  }
}
</script>

<style lang="scss" scoped>
div {
  display: flex;
  align-items: center;

  .message {
    font-weight: 300;
    font-size: 10px;
    line-height: 16px;
    color: #646f85;
  }

  .logo {
    margin-left: 5px;
    height: 24px;
  }
}
</style>
