<template>
  <div class="content">
    <div class="text">
      Ledger works best in browser. Once you are done return to your wallet in the extension...
    </div>
  </div>
</template>

<script>
export default {}
</script>

<style lang="scss" scoped>
.content {
  margin-top: 2rem;
  margin-bottom: 4em;

  .text {
    position: absolute;
    left: 0;
    padding-bottom: 2rem;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    border-bottom: 1px solid #d9dfe5;
    color: #a8aeb7;
    font-style: normal;
    font-weight: 400;
    font-size: 15px;
    line-height: 15px;
  }
}
</style>
