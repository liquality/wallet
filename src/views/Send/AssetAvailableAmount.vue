<template>
  <div class="send-bottom-available" id="send_available_balance">
    <span class="text-muted">{{ $t('common.available') }}</span>
    {{ isNaN(available) ? '0' : dpUI(available) || '0' }}<br />{{ asset }}
  </div>
</template>
<script>
import { dpUI } from '@liquality/wallet-core/dist/src/utils/coinFormatter'

export default {
  name: 'AssetAvailableAmount',
  props: ['available', 'asset'],
  methods: {
    dpUI
  }
}
</script>
