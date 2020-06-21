import Vue from 'vue'

export default Vue.directive('click-away', {
  bind: (el, binding, vnode) => {
    el.clickAwayEvent = function (event) {
      if (!(el === event.target || el.contains(event.target))) { // click is outside
        vnode.context[binding.expression](event) // call bound method
      }
    }
    document.body.addEventListener('click', el.clickAwayEvent)
  },
  unbind: (el) => {
    document.body.removeEventListener('click', el.clickAwayEvent)
  }
})
