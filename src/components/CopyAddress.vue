<template>
  <div class="copy-container">
    <div>
      <span>{{ asset }}</span>
    </div>
    <p class="address">
      <span class="font-weight-bold">{{ startAddress }}</span
      >{{ middleAddressPart }}<span class="font-weight-bold">{{ endAddress }}</span>
    </p>
    <button class="copy-btn" @click="$emit('copyAddress')">
      <CopyIcon class="icon" v-if="!addressCopied" />
      <CheckIcon class="icon" v-if="addressCopied" />
      {{ addressCopied ? 'Copied!' : 'Copy address' }}
    </button>
  </div>
</template>

<script>
import CopyIcon from '@/assets/icons/copy.svg'
import CheckIcon from '@/assets/icons/check-primary.svg'

export default {
  props: ['address', 'asset', 'addressCopied'],
  components: {
    CopyIcon,
    CheckIcon
  },
  computed: {
    startAddress() {
      return this.address.slice(0, 6)
    },
    middleAddressPart() {
      return this.address.substring(6, this.address.length - 4)
    },
    endAddress() {
      return this.address.slice(this.address.length - 4)
    }
  }
}
</script>

<style lang="scss" scoped>
.copy-container {
  text-align: left;
}

.address {
  font-size: 12px;
  line-height: 14px;
}

.copy-btn {
  display: flex;
  align-items: center;
  color: #9d4dfa;
  background: transparent;
  border: none;
  cursor: pointer;

  .icon {
    width: 10px;
    height: 10px;
    font-size: 10px;
    line-height: 12px;
    margin-right: 5px;
  }
}
</style>
