<template>
  <div class="empty-state">
    <p>{{ message || `${$t('common.noResults')}` }}</p>
  </div>
</template>
<script>
export default {
  name: 'NoTransactionsFound',
  props: ['message']
}
</script>
<style scoped lang="scss">
.empty-state {
  min-height: 300px;
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  p {
    font-size: 1rem;
    margin: 0;
  }
}
</style>
