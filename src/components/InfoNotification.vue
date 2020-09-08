<template>
  <div class="info-notification">
     <div class="media">
        <InfoIcon />
        <p class="media-body">
          <slot />
        </p>
      </div>
  </div>
</template>

<script>
import InfoIcon from '@/assets/icons/info.svg'

export default {
  components: {
    InfoIcon
  }
}
</script>

<style lang="scss">
.info-notification {
  height: 68px;
  background: #FFF3BC;
  display: flex;
  align-items: center;
  padding: 14px 20px;

  p {
    margin: 0;
  }

  svg {
    margin-top: 0;
    margin-right: 8px;
    height: 38px;
    width: 38px;
    object-fit: contain;
  }
}
</style>
