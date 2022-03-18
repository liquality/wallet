<template>
  <v-popover offset="1" trigger="click" :placement="'bottom'">
    <slot></slot>
    <template slot="popover">
      <div class="content">
        Anchor offers an open source Savings-as-a-Service. Anchor savings has no minimum deposits,
        account freezes, or signup requirements - it can be used by anyone in the world with access
        to the internet.
      </div>
    </template>
  </v-popover>
</template>

<style scoped lang="scss">
// .popover-arrow {
//         border-color: $bgColor;
//       }

::v-deep .tooltip {
  margin-left: -60px !important;
}
.content {
  text-align: left;

  font-weight: 300;
  font-size: 11px;
  line-height: 16px;
}
</style>
