import '@testing-library/jest-dom'

import { render, fireEvent } from '@testing-library/vue'
import OnBoardingPassword from '../../src/views/Onboarding/OnboardingPassword'

const chrome = require('sinon-chrome')
window.chrome = chrome

test('OnBoarding Password form with match passwords', async () => {
  jest.spyOn(console, 'warn').mockImplementation(() => {})
  const fakeReview = {
    password: '123123123',
    confirmPassword: '123123123'
  }

  const {
    getByText,
    getByLabelText,
    emitted
  } = render(OnBoardingPassword)

  const continueButton = getByText('Continue')

  // Initially the submit button should be disabled.
  expect(continueButton).toBeDisabled()

  const passwordInput = getByLabelText('Choose Password ( At least 8 characters )')
  await fireEvent.update(passwordInput, fakeReview.password)

  const confirmPasswordInput = getByLabelText(/Confirm Password/)
  await fireEvent.update(confirmPasswordInput, fakeReview.confirmPassword)

  // Make sure the submit button is enabled.
  expect(continueButton).toBeEnabled()

  await fireEvent.click(continueButton)
  expect(emitted()).toHaveProperty('on-unlock')
  expect(console.warn).not.toHaveBeenCalled()
})

test.skip('OnBoarding Password form with mismatch passwords', async () => {
  jest.spyOn(console, 'warn').mockImplementation(() => {})
  const fakeReview = {
    password: '123123124',
    confirmPassword: '1231231'
  }

  const {
    getByText,
    getByLabelText,
    queryByTestId
  } = render(
    OnBoardingPassword
  )

  const continueButton = getByText('Continue')

  // Assert error messages are not in the DOM when rendering the component.
  expect(queryByTestId('password_match_error')).not.toBeInTheDocument()

  // Initially the submit button should be disabled.
  expect(continueButton).toBeDisabled()

  const passwordInput = getByLabelText('Choose Password ( At least 8 characters )')
  await fireEvent.update(passwordInput, fakeReview.password)

  const confirmPasswordInput = getByLabelText(/Confirm Password/)
  await fireEvent.update(confirmPasswordInput, fakeReview.confirmPassword)
  await fireEvent.touch(continueButton)

  expect(continueButton).toBeDisabled()
  expect(queryByTestId('password_match_error')).toHaveTextContent(
    "Passwords don't match."
  )
})
