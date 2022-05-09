import Vue from 'vue'

const emitter = new Vue()

const wait = (millis) => new Promise((resolve) => setTimeout(() => resolve(), millis))

export { wait, emitter }
