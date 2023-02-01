<template>
  <div>
    <div class="modal-backdrop"></div>
    <div
      class="modal d-flex"
      tabindex="-1"
      role="dialog"
      @click.passive="closeOutside ? close() : () => {}"
    >
      <div
        :class="{
          'modal-dialog': true,
          [dialog]: true,
          [type]: true,
          'full-height': isFullHeight
        }"
        role="document"
      >
        <div :class="['modal-content', isFullHeight ? 'full-height' : '']">
          <div class="modal-header">
            <div class="modal-header-container" v-if="hasSlot('header')">
              <slot name="header"></slot>
            </div>
            <h5 class="modal-title" v-else-if="hasSlot('title')">
              <slot name="title"></slot>
            </h5>
            <ModalClose class="modal-close" @click="close" :id="closeId" v-if="showClose" />
          </div>
          <div :class="bodyClass">
            <slot></slot>
          </div>
          <div class="modal-footer" v-if="hasSlot('footer')">
            <slot name="footer"></slot>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import ModalClose from '@/assets/icons/modal_close.svg'
export default {
  components: {
    ModalClose
  },
  props: {
    type: {
      type: String,
      default: 'modal-sm'
    },
    dialog: {
      type: String,
      default: 'modal-dialog-centered'
    },
    bodyClass: {
      type: String,
      default: 'modal-body'
    },
    closeOutside: {
      type: Boolean,
      default: false
    },
    isFullHeight: {
      type: Boolean,
      default: false
    },
    closeId: {
      type: String,
      required: false
    },
    showClose: {
      type: Boolean,
      default: true
    }
  },
  methods: {
    hasSlot(name) {
      return this.$slots[name]
    },
    close() {
      this.$emit('close')
    }
  }
}
</script>

<style lang="scss">
.modal-backdrop {
  background-color: rgba(0, 0, 0, 0.1) !important;
}

.modal-dialog {
  margin: $wrapper-padding !important;
}

.modal-dialog-centered {
  min-height: calc(100% - 40px) !important;
  &.full-height {
    min-height: 100vh !important;
    margin: 0 !important;
    width: 100vw !important;
    .modal-header {
      padding: 0 !important;
    }
  }
}

.modal {
  overflow: auto !important;
  align-items: center;
  justify-content: center;
}

.modal-content {
  border-radius: 0 !important;
  border: 1px solid #d9dfe5;
  box-sizing: border-box;
  box-shadow: 2px 4px 4px rgba(46, 44, 44, 0.25);
  overflow: auto;
  max-height: 530px;

  &.full-height {
    max-height: 100%;
    height: 100vh;
    width: 100%;
    padding: 48px;
  }

  .modal-body {
    padding: 5px 20px 0 20px;
  }
}

.modal-header-container {
  display: flex;
  width: 100%;
  align-items: center;
}

.modal-header {
  align-items: center !important;
  border-bottom: 0 !important;
  padding: 20px 20px 0 20px !important;
  svg.modal-close {
    height: 20px;
    cursor: pointer;
  }
}

.modal-footer {
  border-top: 0 !important;
  justify-content: center !important;
}
</style>
