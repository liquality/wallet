<template>
  <div class="available">
    <div class="send-bottom-available" id="send_available_balance">
      <span class="text-muted">Available</span>
      {{ isNaN(amount) ? '0' : dpUI(amount) || '0' }} {{ asset }}
    </div>
  </div>
</template>

<script>
import { dpUI } from '@/utils/coinFormatter'

export default {
  props: ['amount', 'asset'],
  methods: {
    dpUI
  }
}
</script>

<style scoped lang="scss">
.available {
  text-align: end;
  margin-top: 5px;

  .send-bottom-available {
    line-height: 15px;
    text-transform: none;
    font-weight: $font-weight-light;
    font-size: $font-size-tiny;
  }
}
</style>
