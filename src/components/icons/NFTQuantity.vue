<template>
  <div class="nft-quantity" v-if="quantity">x{{ quantity }}</div>
</template>

<script>
export default {
  props: ['quantity']
}
</script>

<style lang="scss">
.nft-quantity {
  font-size: 12px;
  color: #ffffff;
  background: #464646;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  line-height: 24px;
  text-align: center;
  padding: 0;
  position: absolute;
  bottom: 4px;
  left: 6px;
}
</style>
