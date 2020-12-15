<template>
   <div class="wallet-divider"></div>
</template>

<script>

export default {
}
</script>

<style lang="scss">
.wallet-divider {
    width: 100%;
    height: 9px;
    border-top: 1px solid $hr-border-color;
    background:  linear-gradient( #EAB300, #EAB300),
    linear-gradient( #627EEA, #627EEA),
    linear-gradient( #F7CA4F, #F7CA4F),
    linear-gradient( #53AE94, #53AE94),
    linear-gradient( #3186E0, #3186E0),
    linear-gradient( #E99F50, #E99F50);

    background-size: 25% 100%,
                     55% 100%,
                     70% 100%,
                     77% 100%,
                     91% 100%,
                     100% 100%;

    background-repeat: no-repeat;
  }
</style>
