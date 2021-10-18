const TestUtil = require('../../utils/TestUtils')
const OverviewPage = require('../../Pages/OverviewPage')
const HomePage = require('../../Pages/HomePage')
const PasswordPage = require('../../Pages/PasswordPage')
const SeedWordsPage = require('../../Pages/SeedWordsPage')
const expect = require('chai').expect

const puppeteer = require('puppeteer')

const testUtil = new TestUtil()
const overviewPage = new OverviewPage()
const homePage = new HomePage()
const passwordPage = new PasswordPage()
const seedWordsPage = new SeedWordsPage()

let browser, page
const password = '123123123'

describe('Derived path address validation-["mainnet","smoke"]', async () => {
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

  // Create a new wallet - ETH & RSK addresses are equal
  it('Validate derived path address are equal for ETH & RSK chains if balance is 0', async () => {
    // Create new wallet
    await homePage.ClickOnCreateNewWallet(page)
    // Set password & submit details
    await passwordPage.SubmitPasswordDetails(page, password)

    // Unlocking wallet...
    const seed1 = (await seedWordsPage.GetBackupSeedWords(page)).seed1
    const seed5 = (await seedWordsPage.GetBackupSeedWords(page)).seed5
    const seed12 = (await seedWordsPage.GetBackupSeedWords(page)).seed12
    // Click Next
    await seedWordsPage.ClickOnWalletNextButton(page)
    // Enter seed1,5,.12
    await seedWordsPage.EnterSeedWords(page, seed1, seed5, seed12)
    // continue
    await seedWordsPage.ClickContinueButton(page)

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
    // check Send & Swap & Receive options have been displayed
    await page.waitForSelector('#total_assets', { timeout: 60000 })
    const assetsCount = await page.$eval('#total_assets', (el) => el.textContent)
    expect(assetsCount, 'total assets validation on overview page').contain('8 Assets')

    const assertAddresses = []

    // GET the ETHEREUM Address
    const ethAddress = await overviewPage.GetAssertAddress(page, 'ETHEREUM')
    // GET the RSK Address
    const rskAddress = await overviewPage.GetAssertAddress(page, 'RSK')
    // BSC
    const bscAddress = await overviewPage.GetAssertAddress(page, 'BSC')
    // POLYGON
    const polygonAddress = await overviewPage.GetAssertAddress(page, 'POLYGON')
    // ARBITRUM
    const arbitrumAddress = await overviewPage.GetAssertAddress(page, 'ARBITRUM')

    assertAddresses.push(ethAddress, rskAddress, bscAddress, polygonAddress, arbitrumAddress)
    expect(assertAddresses.every((val, i, arr) => val === arr[0]),
      'Balance 0 wallet should have same derived paths for chains-[ETHEREUM,RSK,BSC,POLYGON,ARBITRUM]')
      .eq(true)
    expect(rskAddress, 'ETH & RSK Address are same if the wallet created with 0 balance')
      .equals(ethAddress)

    // Validate ERC20 derived path validations
    // RSK coins address validations
    await page.click('#RSK')
    await page.click('#RBTC')
    await page.waitForSelector('#RBTC_address_container', { visible: true })
    const rbtcAddress = await page.$eval('#RBTC_address_container', (el) => el.textContent)

    await page.click('#previous_nav_bar')
    await page.click('#RSK')
    await page.click('#SOV')
    await page.waitForSelector('#SOV_address_container', { visible: true })
    const sovAddress = await page.$eval('#SOV_address_container', (el) => el.textContent)
    // SOV & RBTC address are equal
    expect(sovAddress, 'SOV & RBTC address are equal').eq(rbtcAddress)
  })
  // Import wallet with existing RSK & RSK legacy accounts
  it('Balance > 0 wallet, validate ETH & RSK & RSK regency derived path not same', async () => {
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
    // check Send & Swap & Receive options have been displayed (RSK & RSK legacy)
    await page.waitForSelector('#total_assets', { timeout: 60000 })
    const assetsCount = await page.$eval('#total_assets', (el) => el.textContent)
    expect(assetsCount, 'validate total assets on overview page').contain('9 Assets')

    // Validate RSK & RSK legacy chains listed
    const rskAccounts = await page.$$('#RSK')
    expect(rskAccounts.length, 'RSK & RSK legacy chains not listed').eqls(2)

    const assertAddresses = []

    // GET the ETHEREUM assert Address
    const ethAddress = await overviewPage.GetAssertAddress(page, 'ETHEREUM')
    // GET the RSK Address
    const rskAddress = await overviewPage.GetAssertAddress(page, 'RSK')
    // BSC
    const bscAddress = await overviewPage.GetAssertAddress(page, 'BSC')
    // POLYGON
    const polygonAddress = await overviewPage.GetAssertAddress(page, 'POLYGON')
    // ARBITRUM
    const arbitrumAddress = await overviewPage.GetAssertAddress(page, 'ARBITRUM')
    assertAddresses.push(ethAddress, bscAddress, polygonAddress, arbitrumAddress)
    expect(assertAddresses.every((val, i, arr) => val === arr[0]),
      'Balance > 0 wallet should have same derived paths for chains-[ETHEREUM,BSC,POLYGON,ARBITRUM]')
      .eq(true)
    // ETH & RSK derived paths are different
    expect(rskAddress, 'ETH & RSK Addresses should be equal').equals(ethAddress)
    // Validate ERC20 derived path validations
    // RSK coins address validations
    await page.click('#RSK')
    await page.click('#RBTC')
    await page.waitForSelector('#RBTC_address_container', { visible: true })
    const rbtcAddress = await page.$eval('#RBTC_address_container', (el) => el.textContent)
    const rbtcValue = await page.$eval('#RBTC_balance_value', (el) => el.textContent)

    await page.click('#previous_nav_bar')
    await page.click('#RSK')
    await page.click('#SOV')
    await page.waitForSelector('#SOV_address_container', { visible: true })
    const sovAddress = await page.$eval('#SOV_address_container', (el) => el.textContent)
    const sovValue = await page.$eval('#SOV_balance_value', (el) => el.textContent)
    expect(sovAddress, 'SOV & RBTC address are equal').eq(rbtcAddress)
    expect(rbtcValue, 'RBTC value shouldn\'t be 0').not.equals('0')
    expect(sovValue, 'SOV value shouldn\'t be 0').not.equals('0')
  })
  // Create a new wallet & forgot password & enter new seedpharse
  it('Validate derived path address after user enter new seedpharse after lock', async () => {
    // Create new wallet
    await homePage.ClickOnCreateNewWallet(page)
    // Set password & submit details
    await passwordPage.SubmitPasswordDetails(page, password)

    // Unlocking wallet...
    const seed1 = (await seedWordsPage.GetBackupSeedWords(page)).seed1
    const seed5 = (await seedWordsPage.GetBackupSeedWords(page)).seed5
    const seed12 = (await seedWordsPage.GetBackupSeedWords(page)).seed12
    // Click Next
    await seedWordsPage.ClickOnWalletNextButton(page)
    // Enter seed1,5,.12
    await seedWordsPage.EnterSeedWords(page, seed1, seed5, seed12)
    // continue
    await seedWordsPage.ClickContinueButton(page)

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
    // check Send & Swap & Receive options have been displayed
    await page.waitForSelector('#total_assets', { timeout: 60000 })
    const assetsCount = await page.$eval('#total_assets', (el) => el.textContent)
    expect(assetsCount).contain(' 8 Assets ')

    const assertAddresses = []

    // GET the ETHEREUM Address
    const ethAddress = await overviewPage.GetAssertAddress(page, 'ETHEREUM')
    // GET the RSK Address
    const rskAddress = await overviewPage.GetAssertAddress(page, 'RSK')
    // BSC
    const bscAddress = await overviewPage.GetAssertAddress(page, 'BSC')
    // POLYGON
    const polygonAddress = await overviewPage.GetAssertAddress(page, 'POLYGON')
    // ARBITRUM
    const arbitrumAddress = await overviewPage.GetAssertAddress(page, 'ARBITRUM')
    assertAddresses.push(ethAddress, rskAddress, bscAddress, polygonAddress, arbitrumAddress)
    console.log('assertAddresses', assertAddresses)
    expect(assertAddresses.every((val, i, arr) => val === arr[0]),
      'Balance 0 wallet should have same derived paths for chains-[ETHEREUM,RSK,BSC,POLYGON,ARBITRUM]')
      .eq(true)
    expect(rskAddress, 'ETH & RSK Address are same if the wallet created with 0 balance')
      .equals(ethAddress)

    // Validate ERC20 derived path validations
    // RSK coins address validations
    await page.click('#RSK')
    await page.click('#RBTC')
    await page.waitForSelector('#RBTC_address_container', { visible: true })
    const rbtcAddress = await page.$eval('#RBTC_address_container', (el) => el.textContent)

    await page.click('#previous_nav_bar')
    await page.click('#RSK')
    await page.click('#SOV')
    await page.waitForSelector('#SOV_address_container', { visible: true })
    const sovAddress = await page.$eval('#SOV_address_container', (el) => el.textContent)

    expect(sovAddress, 'SOV & RBTC address are equal').eq(rbtcAddress)
    // Lock app
    await overviewPage.ClickOnBurgerIcon(page)
    await page.waitForSelector('#lock', { visible: true })
    await page.click('#lock')
    // forgot_password_import_seed
    await page.waitForSelector('#forgot_password_import_seed', { visible: true })
    await page.click('#forgot_password_import_seed')
    // some random seed phrase
    const randomSeed = 'sense quality accuse asthma imitate rubber acquire surprise strategy whip harvest survey'.split(' ')
    const seedsWordsCount = await page.$$('#import_wallet_word')
    for (let i = 0; i < seedsWordsCount.length; i++) {
      const wordInput = seedsWordsCount[i]
      await wordInput.type(randomSeed[i])
    }
    // Click on continue button
    await page.click('#import_wallet_continue_button')
    console.log('Import wallet continue button has been clicked')

    // Create a password & submit
    await passwordPage.SubmitPasswordDetails(page, password)

    // check Send & Swap & Receive options have been displayed
    await overviewPage.ValidateSendSwipeReceiveOptions(page)
    // After enter new seed phrase wallet will have RSK & RSK legacy accounts
    await page.waitForSelector('#total_assets', { timeout: 60000 })
    const assetsCountNew = await page.$eval('#total_assets', (el) => el.textContent)
    expect(assetsCountNew, 'total assets should be 8 on overview page').contain('9 Assets')
  })
})
