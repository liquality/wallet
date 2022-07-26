<template>
  <img :src="logo" class="logo" />
</template>

<script>
import OnRamperLogo from '@/assets/icons/onramper-logo.png'
import TransakLogo from '@/assets/icons/transak-logo.png'
export default {
  props: ['provider'],
  computed: {
    logo() {
      const logos = {
        onramper: OnRamperLogo,
        transak: TransakLogo
      }
      return logos[this.provider]
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
