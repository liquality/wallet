<template>
  <div class="warning">
     <div class="media"><WarningIcon /><p class="text-muted media-body">Experimental software, use at own risk</p></div>
  </div>
</template>

<script>
import WarningIcon from '@/assets/icons/warning.svg'

export default {
  components: {
    WarningIcon
  }
}
</script>

<style lang="scss">
.warning {
  text-align: left;

  svg {
    margin-top: 0;
    margin-right: 8px;
    height: 20px;
    width: 20px;
    object-fit: contain;
  }
  p {
    font-size: $font-size-sm;
  }
}
</style>
