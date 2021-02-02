<template>
  <div class="info-notification">
      <slot />
  </div>
</template>

<script>

export default {
}
</script>

<style lang="scss" scoped>
.info-notification {
  min-height: 55px;
  background: rgba(255, 243, 188, 0.5);
  margin: 0;
  font-weight: 300;
  font-size: 12px;
  line-height: 22px;
  display: flex;
  align-items: center;
  padding: 8px 20px;
}
</style>
