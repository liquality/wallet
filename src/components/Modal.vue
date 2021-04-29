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
             <h5 class="modal-title" v-if="hasSlot('title')">
               <slot name="title"></slot>
             </h5>
              <a href="#" @click="close" >
                        <ModalClose class="modal-close"/>
          </a>
          </div>
           <div class="modal-body">
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

.modal {
  overflow: auto!important;
}
.modal-content {
  border-radius: 0 !important;
  border: 1px solid #D9DFE5;
  box-sizing: border-box;
  box-shadow: 2px 4px 4px rgba(46, 44, 44, 0.25);
}
.modal-header {
  border-bottom: 0 !important;
  padding: 20px 20px 0 20px !important;

  .modal-title {
    text-transform: uppercase;
    font-weight: 600;
    font-size: 14px;
    line-height: 20px;
  }
  svg.modal-close {
    height: 20px;
    cursor: pointer;
  }
}
.modal-footer {
  border-top: 0 !important;
  padding: 0 20px 18px 20px !important;
  justify-content: center !important;
}
</style>
