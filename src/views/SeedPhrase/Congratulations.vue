<template>
    <div class="login-wrapper congrats-seed no-outer-pad">
        <div class="congrats-seed_top mt-5">
            <h1 class="mb-3">Congrats!</h1>
            <CompletedIcon class="backup-wallet_icon" />
        </div>
    </div>
</template>

<script>

import CompletedIcon from '@/assets/icons/completed.svg'

export default {
  components: {
    CompletedIcon
  }
}

</script>

<style lang="scss">

.congrats-seed {
  padding: 0 !important;
  overflow: hidden;
  &_top {
      h1 {
          color: $color-text-secondary;
      }
  }
  &_icon {
      width: 100px;
      height: 100px;
      margin: 10px 0;
  }
}

</style>
