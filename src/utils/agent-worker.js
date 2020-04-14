import axios from 'axios'

import agents from './agents'
import market from './market'

function newOrder (agentIndex, data) {
  return axios({
    url: agents[agentIndex] + '/order',
    method: 'post',
    data,
    headers: {
      'x-requested-with': 'https://liquality.io'
    }
  }).then(res => res.data)
}

function updateOrder (agentIndex, id, data) {
  return axios({
    url: agents[agentIndex] + '/order/' + id,
    method: 'post',
    data,
    headers: {
      'x-requested-with': 'https://liquality.io'
    }
  }).then(res => res.data)
}

const methods = {
  market,
  newOrder,
  updateOrder
}

addEventListener('message', async event => {
  const { id, method, args } = event.data

  try {
    const result = await methods[method](...args)

    postMessage({
      id,
      result
    })
  } catch (error) {
    postMessage({
      id,
      error
    })
  }
})
