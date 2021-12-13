const TestUtil = require('../utils/TestUtils')
const OverviewPage = require('../pages/OverviewPage')
const HomePage = require('../pages/HomePage')
const PasswordPage = require('../pages/PasswordPage')
const expect = require('chai').expect

const puppeteer = require('puppeteer')

const testUtil = new TestUtil()
const overviewPage = new OverviewPage()
const homePage = new HomePage()
const passwordPage = new PasswordPage()

let browser, page
const password = '123123123'

describe('Import wallet-["mainnet","testnet"]', async () => {
  beforeEach(async () => {
    console.log(testUtil.getChromeOptions())
    console.log(testUtil.extensionRootUrl)
    browser = await puppeteer.launch(testUtil.getChromeOptions())
    page = await browser.newPage()
    await page.goto(testUtil.extensionRootUrl, { waitUntil: 'load', timeout: 60000 })
    // Import wallet option
    await homePage.ClickOnImportWallet(page)
    await homePage.ScrollToEndOfTerms(page)
    await homePage.ClickOnAcceptPrivacy(page)
  })
  afterEach(async () => {
    try {
      await page.close()
      await browser.close()
    } catch (e) {
      throw new Error(e)
    }
  })

  // https://www.notion.so/Wallet-should-validate-mnemonic-per-BIP-39-dac68dd41c664f24a7b4e657fc546281
  it('01-Import wallet with random seed (phrase 11 words) and check continue is disabled', async () => {
    // check continue button has been disabled
    const seedWords = 'blouse sort ice forward ivory enrich connect mimic apple setup level'
    const enterWord = seedWords.split(' ')
    const seedsWordsCount = await page.$$('#import_wallet_word')
    for (let i = 0; i < enterWord.length; i++) {
      const wordInput = seedsWordsCount[i]
      await wordInput.type(enterWord[i])
    }
    // Continue button has been Disabled
    expect(await page.$eval('#import_wallet_continue_button', (el) => el.getAttribute('disabled')),
      'Import wallet continue button has been disabled if the mnemonic is revered change')
      .contains('disabled')
  })
  // https://www.notion.so/Wallet-should-validate-mnemonic-per-BIP-39-dac68dd41c664f24a7b4e657fc546281
  it('02-Import wallet with random numbers (phrase 12 words) and check continue is disabled', async () => {
    const seedWords = '1 2 3 4 5 6 7 8 9 10 11 12'
    const enterWord = seedWords.split(' ')
    const seedsWordsCount = await page.$$('#import_wallet_word')
    for (let i = 0; i < enterWord.length; i++) {
      const wordInput = seedsWordsCount[i]
      await wordInput.type(enterWord[i])
    }
    // Continue button has been Disabled
    expect(await page.$eval('#import_wallet_continue_button', (el) => el.getAttribute('disabled')),
      'Import wallet continue button has been disabled if the mnemonic is revered change')
      .contains('disabled')
  })
  it('03-Import wallet with random seed (phrase 12 words) and check continue is disabled', async () => {
    const seedWords = 'PSYOF MLIVD WYKYV LTSXE YJKAS AORWH AEHMI LITKC JKKKK SQYGK AJJSO YCNSX'
    const enterWord = seedWords.split(' ')
    const seedsWordsCount = await page.$$('#import_wallet_word')
    for (let i = 0; i < enterWord.length; i++) {
      const wordInput = seedsWordsCount[i]
      await wordInput.type(enterWord[i])
    }
    // Continue button has been Disabled
    expect(await page.$eval('#import_wallet_continue_button', (el) => el.getAttribute('disabled')),
      'Import wallet continue button has been disabled if the mnemonic is revered change')
      .contains('disabled')
  })
  it('04-Import wallet with random seed (phrase 12 words) and check continue is disabled', async () => {
    const seedWords = 'spawp cage misery pave blue uncle pilot upon talent caution return fat'
    const enterWord = seedWords.split(' ')
    const seedsWordsCount = await page.$$('#import_wallet_word')
    for (let i = 0; i < enterWord.length; i++) {
      const wordInput = seedsWordsCount[i]
      await wordInput.type(enterWord[i])
    }
    // Continue button has been Disabled
    expect(await page.$eval('#import_wallet_continue_button', (el) => el.getAttribute('disabled')),
      'Import wallet continue button has been disabled if the mnemonic is revered change')
      .contains('disabled')
  })
  it('05-Import wallet with random seed (phrase 12 words reverse order) and check continue is disabled', async () => {
    // correct one - seminar amount airport narrow noble uncle inside matrix short moral change donor
    // changed order - seminar amount airport narrow noble uncle inside matrix short moral donor change
    const seedWords = 'seminar amount airport narrow noble uncle inside matrix short moral donor change'
    const enterWord = seedWords.split(' ')
    const seedsWordsCount = await page.$$('#import_wallet_word')
    for (let i = 0; i < enterWord.length; i++) {
      const wordInput = seedsWordsCount[i]
      await wordInput.type(enterWord[i])
    }
    // Continue button has been Disabled
    expect(await page.$eval('#import_wallet_continue_button', (el) => el.getAttribute('disabled')),
      'Import wallet continue button has been disabled if the mnemonic is revered change')
      .contains('disabled')
  })
  it('06-Import wallet with correct mnemonic (phrase 12 words) and check continue is enabled', async () => {
    const seedWords = 'ski crush picture rail time lion receive biology hire egg volume inner'
    const enterWord = seedWords.split(' ')
    const seedsWordsCount = await page.$$('#import_wallet_word')
    for (let i = 0; i < enterWord.length; i++) {
      const wordInput = seedsWordsCount[i]
      await wordInput.type(enterWord[i])
    }
    // Continue button has been Disabled
    await page.click('#import_wallet_continue_button')
    await page.waitForSelector('#password', { visible: true })
  })
  it('06-Import wallet with random seed (phrase 24 words) and check continue is disabled', async () => {
    await page.waitForSelector('#word_button_group', { visible: true })
    await page.click('#twenty_four_words_option')
    // check continue button has been disabled
    const seedWords = 'correce paper dust pyramid quarter legal test legend solar knife rack finish because list confirm expose sniff sure plastic humor eight mask company mosquito'
    const enterWord = seedWords.split(' ')
    const seedsWordsCount = await page.$$('#import_wallet_word')
    for (let i = 0; i < enterWord.length; i++) {
      const wordInput = seedsWordsCount[i]
      await wordInput.type(enterWord[i])
    }
    // Continue button has been Disabled
    expect(await page.$eval('#import_wallet_continue_button', (el) => el.getAttribute('disabled')),
      'Import wallet continue button has been disabled if the mnemonic is revered change')
      .contains('disabled')
  })
  it('Import wallet with (12 seed words) and see balance & validate ETH & RSK derived path-[smoke]', async () => {
    await homePage.EnterSeedWords(page)
    await passwordPage.SubmitPasswordDetails(page, password)
    // overview page
    await overviewPage.CloseWatsNewModal(page)
    await overviewPage.HasOverviewPageLoaded(page)
    if (process.env.NODE_ENV === 'mainnet') {
      await overviewPage.SelectNetwork(page, 'mainnet')
    } else {
      await overviewPage.SelectNetwork(page)
    }
    // check Send & Swap & Receive options have been displayed
    await overviewPage.ValidateSendSwipeReceiveOptions(page)
    // validate the total assets on overview screen.
    await overviewPage.ValidateTotalAssets(page, false) // 10 assets
    // Check the currency
    expect(await overviewPage.GetCurrency(page),
      'Wallet stats has currency should be USD').contain('USD')

    // Check the Total amount - 10s wait to load amount
    const totalAmount = await overviewPage.GetTotalLiquidity(page)
    expect(parseInt(totalAmount), 'Funds in my wallet should be greater than 0 USD').greaterThanOrEqual(0)
    console.log('After Import wallet, the funds in the wallet:', totalAmount)

    // GET the ETHEREUM assert Address
    const ethAddress = await overviewPage.GetAssertAddress(page, 'ETHEREUM')
    const rskAddress = await overviewPage.GetAssertAddress(page, 'RSK')
    expect(rskAddress, `ETH address ${ethAddress}& RSK address ${rskAddress} should be equal if balance is greater than 0`)
      .equals(ethAddress)

    // Check RSK & ERC20 tokens
    const rskTokens = ['RBTC', 'SOV', 'FISH']
    if (process.env.NODE_ENV === 'mainnet') {
      await page.click('#RSK')
      for (let i = 0; i < rskTokens.length; i++) {
        const token = rskTokens[i]
        await page.waitForSelector(`#${token}`, { visible: true })
      }
    }
  })
  it('Import wallet with (24 seed words) and see balance', async () => {
    // Enter seed words and submit, select 24 seed option
    await page.waitForSelector('#word_button_group', { visible: true })
    await page.click('#twenty_four_words_option')
    const seedWords = await page.$$eval('#import_wallet_word', (el) => el.length)
    expect(seedWords).equals(24)
    // Enter 24 seed words
    await homePage.EnterSeedWords(page, 24)
    // Create a password & submit
    await passwordPage.SubmitPasswordDetails(page, password)
    // overview page
    await overviewPage.CloseWatsNewModal(page)
    await overviewPage.HasOverviewPageLoaded(page)
    // Select testnet
    await overviewPage.SelectNetwork(page)
    // check Send & Swap & Receive options have been displayed
    await overviewPage.ValidateSendSwipeReceiveOptions(page)
    // validate the testnet asserts count
    await overviewPage.ValidateTotalAssets(page, false) // 9 assets
    // Check the currency
    expect(await overviewPage.GetCurrency(page),
      'Wallet stats has currency should be USD').contain('USD')
  })
})
