<template>
  <div class="copy-container">
    <button class="copy-btn" @click="copyError">
      <CopyIcon class="icon" v-if="!errorCopied" />
      <CheckIcon class="icon" v-if="errorCopied" />
      {{ errorCopied ? $t('common.copied') : $t('common.copyError') }}
    </button>
  </div>
</template>

<script>
import CopyIcon from '@/assets/icons/copy.svg'
import CheckIcon from '@/assets/icons/check-primary.svg'
import { liqualityErrorStringToJson } from '@liquality/error-parser'

export default {
  props: ['translatedError', 'liqualityErrorString'],
  components: {
    CopyIcon,
    CheckIcon
  },
  computed: {
    jsonError() {
      return {
        error: liqualityErrorStringToJson(this.liqualityErrorString),
        friendlyMessage: this.translatedError
      }
    }
  },
  data() {
    return {
      errorCopied: false
    }
  },
  methods: {
    async copyError() {
      await navigator.clipboard.writeText(JSON.stringify(this.jsonError))
      this.errorCopied = true
      setTimeout(() => {
        this.errorCopied = false
      }, 4000)
    }
  }
}
</script>

<style lang="scss" scoped>
.copy-container {
  text-align: right;
  margin-left: auto;
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
