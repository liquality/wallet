<template>
  <div class="no-balance">
    <p>
      {{ label }}
    </p>

    <div class="receive">
      <p @click="$router.push(`/accounts/${accountId}/${asset}/receive`)">Receive</p>
      <span>or</span>
      <p>Buy</p>
    </div>
  </div>
</template>

<script>
export default {
  props: ['label']
}
</script>

<style lang="scss" scoped>
.no-balance {
  background: #fff8da;
  height: 87px;
  padding: 10px 20px;
  font-weight: 500;

  p {
    margin-bottom: 0;
  }

  .receive {
    display: flex;
    margin-top: 9px;

    p {
      width: 86px;
      height: 22px;
      background: white;
      border-radius: 12px;
      text-align: center;
      padding-top: 2.5px;
      cursor: pointer;
    }

    span {
      margin: 0 10px;
      padding-top: 2.5px;
    }
  }
}
</style>
