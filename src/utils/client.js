import Emitter from 'events'
import { v4 as uuidv4 } from 'uuid'

const emitter = new Emitter()
const worker = new Worker('./worker', { type: 'module' })

worker.onmessage = event => {
  const { data } = event

  emitter.emit(data.id, data)
}

export default chain => (method, returnType) => (...args) => {
  const id = uuidv4()

  worker.postMessage({
    id,
    chain,
    method,
    args,
    returnType
  })

  return new Promise((resolve, reject) => {
    emitter.once(id, data => {
      if (data.error) reject(data.error)
      else resolve(data.result)
    })
  })
}
