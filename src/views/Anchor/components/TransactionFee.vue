<template>
  <div class="transaction-fee">
    <strong>TRANSACTION FEE</strong>
    <span> ({{ txFee }} {{ asset }}) </span>
  </div>
</template>

<script>
export default {
  props: ['txFee', 'asset']
}
</script>

<style lang="scss" scoped>
.transaction-fee {
  margin-top: 25px;
}
</style>
