import '@testing-library/jest-dom'
import { render, fireEvent } from '@testing-library/vue'
import NoLiquidityMessage from '../../src/components/NoLiquidityMessage'
const chrome = require('sinon-chrome')
window.chrome = chrome

beforeEach(() => {
  jest.spyOn(console, 'log').mockImplementation(() => {})
})

afterEach(() => {
  console.log.mockRestore()
})

test('No liquidity message component', () => {
  const { debug } = render(NoLiquidityMessage)
  debug()

  expect(console.log).toHaveBeenCalledTimes(1)
  expect(console.log).toHaveBeenCalledWith(
    expect.stringContaining('No liquidity.')
  )
  expect(console.log).toHaveBeenCalledWith(
    expect.stringContaining('Request liquidity for tokens via')
  )
})

test('renders button with text', () => {
  const text = 'Liquality Discord'

  // Set the prop value by using the second argument of `render()`.
  const { getByRole } = render(NoLiquidityMessage, {
    props: { text }
  })

  // Get the only element with a 'button' role.
  const button = getByRole('button')

  expect(button).toHaveTextContent(text)
})

test('emits click event when button is clicked', async () => {
  const text = 'Liquality Discord'

  const { getByRole, emitted } = render(NoLiquidityMessage, {
    props: { text }
  })

  // Send a click event.
  await fireEvent.click(getByRole('button'))

  // Expect that the event emitted a "click" event. We should test for emitted
  // events has they are part of the public API of the component.
  expect(emitted()).toBeTruthy()
})
