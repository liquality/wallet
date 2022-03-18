<template>
  <div class="powered-by">
    <span>powered by</span>
    <Popover>
      <div @click="$emit('setGettingStarted')">
        <span><strong>ANCHOR</strong> EARN</span>
      </div>
    </Popover>
  </div>
</template>

<script>
import Popover from './Popover.vue'

export default {
  components: {
    Popover
  }
}
</script>

<style lang="scss" scoped>
.powered-by {
  display: flex;
  align-self: flex-end;
  font-size: 10px;

  & > span {
    color: #747e8d;
    margin-right: 4px;
  }

  div {
    background: #d9dfe5;
    border-radius: 12px;
    height: 17px;
    text-align: center;
    width: 110px;
  }
}
</style>
