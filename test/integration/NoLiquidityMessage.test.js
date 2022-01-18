import '@testing-library/jest-dom'
import { render } from '@testing-library/vue'
import NoLiquidityMessage from '../../src/components/NoLiquidityMessage'
const chrome = require('sinon-chrome')
window.chrome = chrome

beforeEach(() => {
  jest.spyOn(console, 'log').mockImplementation(() => {})
})

afterEach(() => {
  console.log.mockRestore()
})

test('No liquidity message component when pair is available', () => {
  const { debug } = render(NoLiquidityMessage, { props: { isPairAvailable: true } })
  debug()

  expect(console.log).toHaveBeenCalledTimes(1)
  expect(console.log).toHaveBeenCalledWith(
    expect.stringContaining('Liquidity low')
  )
})

test('No liquidity message component when pair is unavailable', () => {
  const { debug } = render(NoLiquidityMessage, { props: { isPairAvailable: false } })
  debug()

  expect(console.log).toHaveBeenCalledTimes(1)
  expect(console.log).toHaveBeenCalledWith(
    expect.stringContaining('Pair not supported')
  )
})
