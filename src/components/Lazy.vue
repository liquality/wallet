<template>
  <div>
    <slot v-if="shouldRender" />
  </div>
</template>

<script>
export default {
  data() {
    return {
      shouldRender: false
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.shouldRender = true
    })
  }
}
</script>
