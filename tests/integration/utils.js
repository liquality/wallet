/* eslint-env jest */
const puppeteer = require('puppeteer')
const crypto = require('crypto')
const buildConfig = require('../../src/build.config.js')

jest.setTimeout(20000)

function generateExtensionId (absolutePath) {
  const hash = crypto.createHash('sha256').update(absolutePath, 'utf8').digest().toString('hex')

  const chars = []

  for (const char of hash) {
    const resultNumber = 'a'.charCodeAt(0) + parseInt(char, 16)
    const character = String.fromCharCode(resultNumber)
    chars.push(character)
  }

  return chars.slice(0, 32).join('')
}

const EXTENSION_BUILD_PATH = require('path').join(__dirname, '..', '..', 'dist')
const EXTENSION_ID = generateExtensionId(EXTENSION_BUILD_PATH)
const EXTENSION_ROOT_URL = `chrome-extension://${EXTENSION_ID}/index.html#/`

const ENV_SEED = process.env.SEED
if (!ENV_SEED) {
  throw new Error('SEED env variable required')
}
const SEED = ENV_SEED.split(' ')

const PASSWORD = '123123123'

const ETH_ADDRESS = '0xe2f20d777c46e9e7464D32AaF7634992257a21eD'

const CONSTANTS = {
  SEED,
  PASSWORD,
  EXTENSION_ID,
  EXTENSION_ROOT_URL,
  ETH_ADDRESS
}

async function expectWalletOpen (page, network = 'mainnet') {
  const navbarTitle = await page.$eval('.navbar_title', el => el.textContent)

  expect(navbarTitle).toContain('Account 1')
  expect(navbarTitle).toContain(network)

  await page.waitFor((buildConfig, network) => document.querySelectorAll('.account-item').length === buildConfig[network].length, undefined, buildConfig, network)
}

async function importWallet (page) {
  await page.click('.btn-primary') // Accept terms
  const importLink = await page.$('a[href="#/onboarding/import"]')
  await importLink.click()

  // type seed
  for (let i = 0; i < 12; i++) {
    const wordInput = await page.$(`.import-wallet_seed div:nth-child(${i + 1}) input`)
    await wordInput.type(SEED[i])
  }
  await page.click('.btn-primary') // Submit

  await page.type('#password', PASSWORD)
  await page.type('#confirmPassword', PASSWORD)
  await page.click('.btn-primary') // Submit

  // Unlocking wallet...
  await page.waitFor('.wallet')
}

async function switchToTestnet (page) {
  await page.click('.head_network')
  const testnetLink = await page.waitForXPath('//li[contains(text(),"Testnet")]')
  await testnetLink.click()
}

async function setup () {
  const browser = await puppeteer.launch({
    headless: false, // extensions not supported in headless
    args: [
      `--disable-extensions-except=${EXTENSION_BUILD_PATH}`,
      `--load-extension=${EXTENSION_BUILD_PATH}`
    ]
  })
  const page = await browser.newPage()
  await page.goto(EXTENSION_ROOT_URL)

  return { browser, page }
}

export {
  CONSTANTS,
  setup,
  expectWalletOpen,
  switchToTestnet,
  importWallet
}
