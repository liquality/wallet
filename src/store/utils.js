import Vue from 'vue'

export const emitter = new Vue()

const wait = (millis) => new Promise((resolve) => setTimeout(() => resolve(), millis))

export { wait }
