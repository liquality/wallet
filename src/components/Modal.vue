<template>
  <div>
    <div class="modal-backdrop"></div>
    <div class="modal d-block"
         tabindex="-1"
         role="dialog"
         @click.passive="closeOutside ? close() : () => {}">
      <div :class="{
        'modal-dialog modal-dialog-centered': true,
        [type]: true
      }" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <div class="modal-header-container" v-if="hasSlot('header')">
               <slot name="header"></slot>
             </div>
             <h5 class="modal-title" v-else-if="hasSlot('title')">
               <slot name="title"></slot>
             </h5>
              <ModalClose class="modal-close" @click="close"/>
          </div>
           <div :class="bodyClass">
             <slot></slot>
           </div>
           <div class="modal-footer"  v-if="hasSlot('footer')">
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
    bodyClass: {
      type: String,
      default: 'modal-body'
    },
    closeOutside: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    hasSlot (name) {
      return this.$slots[name]
    },
    close () {
      this.$emit('close')
    }
  }
}
</script>

<style lang="scss">
.modal-backdrop {
  background-color: rgba(0, 0, 0, 0.1)!important;
}

.modal-dialog {
  margin: $wrapper-padding !important;
}

.modal-dialog-centered {
  min-height: calc(100% - 40px) !important;
}

.modal {
  overflow: auto!important;
}

.modal-content {
  border-radius: 0 !important;
  border: 1px solid #D9DFE5;
  box-sizing: border-box;
  box-shadow: 2px 4px 4px rgba(46, 44, 44, 0.25);

  .modal-body {
    padding: 20px 20px 0 20px;
  }
}

.modal-header-container {
  display: flex;
  width: 100%;
  align-items: center;
}

.modal-header {
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
