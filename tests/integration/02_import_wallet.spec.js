const TestUtil = require('../utils/TestUtils')
const TestDataUtils = require('../utils/TestDataUtils')
const OverviewPage = require('../Pages/OverviewPage')
const HomePage = require('../Pages/HomePage')
const PasswordPage = require('../Pages/PasswordPage')
const SeedWordsPage = require('../Pages/SeedWordsPage')
const expect = require('chai').expect

const puppeteer = require('puppeteer')

const testUtil = new TestUtil()
const testDataUtils = new TestDataUtils()
const overviewPage = new OverviewPage()
const homePage = new HomePage()
const passwordPage = new PasswordPage()
const seedWordsPage = new SeedWordsPage()

let browser, page
const password = '123123123'

describe('Import wallet-["mainnet"]', async () => {
  beforeEach(async () => {
    browser = await puppeteer.launch(testUtil.getChromeOptions())
    page = await browser.newPage()
    await page.goto(testUtil.extensionRootUrl)
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

  it('Import wallet with random seed (phrase 12 words) with 0 coins', async () => {
    await homePage.ClickOnImportWallet(page)
    console.log('Import wallet page hase been loaded')

    // check continue button has been disabled
    const enterWords = testDataUtils.getRandomSeedWords()
    await seedWordsPage.EnterImportSeedWords(page, enterWords)
    // Create a password & submit
    await passwordPage.SubmitPasswordDetails(page, password)
    // overview page
    await overviewPage.HasOverviewPageLoaded(page)
    await overviewPage.CloseWatsNewModal(page)
    if (process.env.NODE_ENV === 'mainnet') {
      await overviewPage.SelectNetwork(page, 'mainnet')
    } else {
      await overviewPage.SelectNetwork(page)
    }
    // check Send & Swap & Receive options have been displayed
    await overviewPage.ValidateSendSwipeReceiveOptions(page)
    // validate the total assets on overview screen.
    await overviewPage.ValidateTotalAssets(page)
  })
  it('Import wallet with random seed (phrase 11 words) and check continue is disabled', async () => {
    await homePage.ClickOnImportWallet(page)
    console.log('Import wallet page hase been loaded')
    // check continue button has been disabled
    const seedWords = 'blouse sort ice forward ivory enrich connect mimic apple setup level'
    const enterWord = seedWords.split(' ')
    const seedsWordsCount = await page.$$('#import_wallet_word')
    for (let i = 0;i < enterWord.length;i++) {
      const wordInput = seedsWordsCount[i]
      await wordInput.type(enterWord[i])
    }
    // Continue button has been Disabled
    await page.click('#import_wallet_continue_button:not([enabled])')
    console.log('Import wallet continue button has been disabled')
  })
  it('Import wallet with (12 seed words) and see balance & validate ETH & RSK derived path-[smoke]', async () => {
    // Import wallet option
    await homePage.ClickOnImportWallet(page)
    // Enter seed words and submit
    await homePage.EnterSeedWords(page, null)
    // Create a password & submit
    await passwordPage.SubmitPasswordDetails(page, password)
    // overview page
    await overviewPage.HasOverviewPageLoaded(page)
    await overviewPage.CloseWatsNewModal(page)
    if (process.env.NODE_ENV === 'mainnet') {
      await overviewPage.SelectNetwork(page, 'mainnet')
    } else {
      await overviewPage.SelectNetwork(page)
    }
    // check Send & Swap & Receive options have been displayed
    await overviewPage.ValidateSendSwipeReceiveOptions(page)
    // validate the total assets on overview screen.
    await overviewPage.ValidateTotalAssets(page)
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
    expect(rskAddress, 'ETH & RSK Addresses should be different if balance >0').not.equals(ethAddress)

    // Check RSK & ERC20 tokens
    const rskTokens = ['RBTC', 'SOV', 'FISH']
    if (process.env.NODE_ENV === 'mainnet') {
      await page.click('#RSK')
      for (let i = 0;i < rskTokens.length;i++) {
        const token = rskTokens[i]
        await page.waitForSelector(`#${token}`, { visible: true })
      }
    }
  })
  it('Import wallet with (24 seed words) and see balance', async () => {
    // Import wallet option
    await homePage.ClickOnImportWallet(page)
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
    await overviewPage.HasOverviewPageLoaded(page)
    await overviewPage.CloseWatsNewModal(page)
    // Select testnet
    await overviewPage.SelectNetwork(page)
    // check Send & Swap & Receive options have been displayed
    await overviewPage.ValidateSendSwipeReceiveOptions(page)
    // validate the testnet asserts count
    const assetsCount = await overviewPage.ValidateTotalAssets(page)
    expect(assetsCount, 'Total assets in TESTNET should be 8').contain('8 Assets')
    // Check the currency
    expect(await overviewPage.GetCurrency(page),
      'Wallet stats has currency should be USD').contain('USD')
  })
})
