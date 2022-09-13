const TestUtil = require('../../utils/TestUtils')
const OverviewPage = require('../../pages/OverviewPage')
const HomePage = require('../../pages/HomePage')
const PasswordPage = require('../../pages/PasswordPage')
const SeedWordsPage = require('../../pages/SeedWordsPage')
const expect = require('chai').expect

const puppeteer = require('puppeteer')
const { assert } = require('chai')

const testUtil = new TestUtil()
const overviewPage = new OverviewPage()
const homePage = new HomePage()
const passwordPage = new PasswordPage()
const seedWordsPage = new SeedWordsPage()

let browser, page

describe('Derived path address validation-["MAINNET","PULL_REQUEST_TEST","MAINNET_RELEASE"]', async () => {
  beforeEach(async () => {
    browser = await puppeteer.launch(testUtil.getChromeOptions())
    page = await browser.newPage()
    await page.setDefaultNavigationTimeout(0)
    await page.goto(testUtil.extensionRootUrl, { waitUntil: 'networkidle2' })
  })
  afterEach(async () => {
    await browser.close()
  })

  // Create a new wallet - ETH & RSK addresses are equal
  it('Create wallet & validate derived path address are equal for ETH & RSK chains if balance is 0', async () => {
    // Create new wallet
    await homePage.ClickOnCreateNewWallet(page)
    // Terms & conditions
    await homePage.ScrollToEndOfTerms(page)
    await homePage.ClickOnAcceptPrivacy(page)
    // Unlocking wallet...
    const seed1 = (await seedWordsPage.GetBackupSeedWords(page)).seed1
    const seed5 = (await seedWordsPage.GetBackupSeedWords(page)).seed5
    const seed12 = (await seedWordsPage.GetBackupSeedWords(page)).seed12
    // Click Next
    await seedWordsPage.ClickOnWalletNextButton(page)
    // Enter seed1,5,.12
    await seedWordsPage.EnterSeedWords(page, seed1, seed5, seed12)
    await seedWordsPage.ClickContinueButton(page)
    // Set password & click next
    await passwordPage.SubmitPasswordDetails(page)

    // overview page
    await overviewPage.CloseWhatsNewModal(page)
    // check Send & Swap & Receive options have been displayed
    await page.waitForSelector('#total_assets', { timeout: 60000 })
    const assetsCount = await page.$eval('#total_assets', (el) => el.textContent)
    // create a new wallet
    expect(assetsCount, 'total assets validation on overview page').contain('11')
    console.log('Total assets on overview page: ', assetsCount)

    // Check the Total amount - 10s wait to load amount
    const totalAmount = parseInt(await overviewPage.GetTotalLiquidity(page), 10)
    expect(totalAmount, 'Create wallet first time has 0 fiat values').equals(0)
    console.log('Total amount on overview page: ', totalAmount)

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

    const assertAddressesMap = {
      eth_address: ethAddress,
      rsk_address: rskAddress,
      bsc_address: bscAddress,
      polygon_address: polygonAddress,
      arbitrum_address: arbitrumAddress
    }
    console.log('Address after new wallet creation: ' + JSON.stringify(assertAddressesMap))
    assert.isNotEmpty(ethAddress, 'create wallet ETH address should not be empty')
    assert.isNotEmpty(rskAddress, 'create wallet RSK address should not be empty')
    assert.isNotEmpty(bscAddress, 'create wallet BSC address should not be empty')
    assert.isNotEmpty(polygonAddress, 'create wallet POLYGON address should not be empty')
    assert.isNotEmpty(arbitrumAddress, 'create wallet ARBITRUM address should not be empty')

    expect(
      assertAddresses.every((val, i, arr) => val === arr[0]),
      `Balance 0 wallet should have same derived paths for chains-[ETHEREUM,RSK,BSC,POLYGON,ARBITRUM]- ${JSON.stringify(
        assertAddressesMap
      )}`
    ).eq(true)
    expect(rskAddress, 'ETH & RSK Address are same if the wallet created with 0 balance').equals(
      ethAddress
    )

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
  it('Import wallet & balance > 0 wallet, validate ETH & RSK & RSK regency derived path not same', async () => {
    // Import wallet option
    await homePage.ClickOnImportWallet(page)
    await homePage.ScrollToEndOfTerms(page)
    await homePage.ClickOnAcceptPrivacy(page)
    // Enter seed words and submit
    await homePage.EnterSeedWords(page)
    // Create a password & submit
    await passwordPage.SubmitPasswordDetails(page)
    // overview page
    await overviewPage.CloseWhatsNewModal(page)
    await overviewPage.HasOverviewPageLoaded(page)
    await overviewPage.SelectNetwork(page, 'mainnet')
    // check Send & Swap & Receive options have been displayed
    await overviewPage.ValidateSendSwipeReceiveOptions(page)
    // check Send & Swap & Receive options have been displayed (RSK & RSK legacy)
    await page.waitForSelector('#total_assets', { timeout: 120000 })
    const assetsCount = await page.$eval('#total_assets', (el) => el.textContent)
    // import a wallet
    expect(assetsCount, 'validate total assets on overview page').contain('12')

    // Validate RSK & RSK legacy chains listed
    const rskAccounts = await page.$$('#RSK')
    expect(rskAccounts.length, 'RSK & RSK legacy chains not listed').eqls(2)

    const assertAddresses = []

    await page.waitForTimeout(120000)
    // GET the ETHEREUM assert Address
    const ethAddress = await overviewPage.GetAssertAddress(page, 'ETHEREUM')
    expect(ethAddress, 'ETHEREUM address is empty on overview page').to.contain.oneOf(['...'])
    // GET the RSK Address
    const rskChains = await page.$$('#RSK')
    const rsk1Address = await rskChains[0].$eval('#assert_address', (el) => el.textContent.trim())
    const rskLegacyAddress = await rskChains[1].$eval('#assert_address', (el) =>
      el.textContent.trim()
    )
    expect(rsk1Address, "RSK and RSK legacy addresses should n't be same").not.equals(
      rskLegacyAddress
    )
    // BSC
    const bscAddress = await overviewPage.GetAssertAddress(page, 'BSC')
    expect(bscAddress, 'BSC address is empty on overview page').to.contain.oneOf(['...'])
    // POLYGON
    const polygonAddress = await overviewPage.GetAssertAddress(page, 'POLYGON')
    expect(polygonAddress, 'POLYGON address is empty on overview page').to.contain.oneOf(['...'])
    // ARBITRUM
    const arbitrumAddress = await overviewPage.GetAssertAddress(page, 'ARBITRUM')
    expect(arbitrumAddress, 'ARBITRUM address is empty on overview page').to.contain.oneOf(['...'])

    assertAddresses.push(ethAddress, bscAddress, polygonAddress, arbitrumAddress, rsk1Address)
    expect(assertAddresses.length).to.equals(5)
    console.log(assertAddresses)
    expect(
      assertAddresses.every((val, i, arr) => val === arr[0]),
      `Balance > 0 wallet should have same derived paths for chains-[ETHEREUM,BSC,POLYGON,ARBITRUM,RSK] ${assertAddresses}`
    ).eq(true)
    // ETH & RSK derived paths are different
    expect(rsk1Address, 'ETH & RSK Addresses should be equal').equals(ethAddress)

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
    expect(rbtcValue, "RBTC value shouldn't be 0").not.equals('0')
    expect(sovValue, "SOV value shouldn't be 0").not.equals('0')
  })
  // Create a new wallet & forgot password & enter new seed parse
  it('Create wallet & Validate derived path address after user enter new seedpharse after lock', async () => {
    // Create new wallet
    await homePage.ClickOnCreateNewWallet(page)
    // Terms & conditions
    await homePage.ScrollToEndOfTerms(page)
    await homePage.ClickOnAcceptPrivacy(page)
    // Unlocking wallet...
    const seed1 = (await seedWordsPage.GetBackupSeedWords(page)).seed1
    const seed5 = (await seedWordsPage.GetBackupSeedWords(page)).seed5
    const seed12 = (await seedWordsPage.GetBackupSeedWords(page)).seed12
    // Create a password & submit
    const allSeedPhases = await page.$$eval('#backup_seed_word', elements => elements.map(item => item.textContent))
    // Click Next
    await seedWordsPage.ClickOnWalletNextButton(page)
    // Enter seed1,5,.12
    await seedWordsPage.EnterSeedWords(page, seed1, seed5, seed12)
    // continue
    await seedWordsPage.ClickContinueButton(page)
    // Set password
    await passwordPage.SubmitPasswordDetails(page)
    // overview page
    await overviewPage.CloseWhatsNewModal(page)
    // check Send & Swap & Receive options have been displayed
    await overviewPage.ValidateSendSwipeReceiveOptions(page)
    // check Send & Swap & Receive options have been displayed
    await page.waitForSelector('#total_assets', { timeout: 60000 })
    const assetsCount = await page.$eval('#total_assets', (el) => el.textContent)
    expect(assetsCount).contain('11')

    let allAddresses = await testUtil.getAllChainAddresses(page)
    console.log(allAddresses)

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

    let details = {
      ETH: ethAddress,
      RSK: rskAddress,
      BSC: bscAddress,
      POLYGON: polygonAddress,
      ARBITRUM: arbitrumAddress
    }

    assertAddresses.push(ethAddress, rskAddress, bscAddress, polygonAddress, arbitrumAddress)
    expect(
      assertAddresses.every((val, i, arr) => val === arr[0]),
      `Balance 0 wallet should have same derived paths for chains-[ETHEREUM,RSK,BSC,POLYGON,ARBITRUM]- ${JSON.stringify(
        details
      )}`
    ).eq(true)
    expect(
      rskAddress,
      `ETH ${ethAddress} & RSK ${rskAddress} Address are same if the wallet created with 0 balance`
    ).equals(ethAddress)

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
    // Terms & conditions
    await homePage.ScrollToEndOfTerms(page)
    await homePage.ClickOnAcceptPrivacy(page)

    const seedsWordsCount = await page.$$('#import_wallet_word')
    for (let i = 0; i < seedsWordsCount.length; i++) {
      const wordInput = seedsWordsCount[i]
      await wordInput.type(allSeedPhases[i])
    }
    // Click on continue button
    await page.click('#import_wallet_continue_button')
    console.log('Import wallet continue button has been clicked')

    // Create a password & submit
    await passwordPage.SubmitPasswordDetails(page)

    // check Send & Swap & Receive options have been displayed
    await overviewPage.ValidateSendSwipeReceiveOptions(page)
    // After enter new seed phrase wallet will have RSK & RSK legacy accounts
    await page.waitForSelector('#total_assets', { timeout: 60000 })
    const assetsCountNew = await page.$eval('#total_assets', (el) => el.textContent)
    expect(assetsCountNew, 'total assets should be 11 on overview page').contain('12')
  })
})
