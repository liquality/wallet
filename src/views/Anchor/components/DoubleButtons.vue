<template>
  <div class="bottom-wrapper">
    <p @click="$emit('firstButtonHandler')">{{ firstButtonLabel }}</p>
    <p @click="$emit('secondButtonHandler')">{{ secondButtonLabel }}</p>
  </div>
</template>

<script>
export default {
  props: ['firstButtonLabel', 'secondButtonLabel']
}
</script>

<style scoped lang="scss">
.bottom-wrapper {
  display: flex;
  justify-content: space-between;
  flex: 1;
  padding: 20px;
  position: fixed;
  bottom: 0;
  right: 0;
  left: 0;
  background-color: #ffffff;
  z-index: 999;
  p {
    margin-bottom: 0;
    width: 152px;
    height: 36px;
    font-size: 14px;
    line-height: 17px;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 22px;
    cursor: pointer;

    &:nth-child(1) {
      border: 1px solid #9d4dfa;
      color: #9d4dfa;
    }

    &:nth-child(2) {
      background-color: #9d4dfa;
      color: white;
    }
  }
}
</style>
