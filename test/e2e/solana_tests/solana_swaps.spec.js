const TestUtil = require('../../utils/TestUtils')
const OverviewPage = require('../../pages/OverviewPage')
const HomePage = require('../../pages/HomePage')
const PasswordPage = require('../../pages/PasswordPage')
const SwapPage = require('../../pages/SwapPage')
const AddCustomTokenPage = require('../../pages/AddCustomTokenPage')
const expect = require('chai').expect

const puppeteer = require('puppeteer')

const testUtil = new TestUtil()
const overviewPage = new OverviewPage()
const homePage = new HomePage()
const passwordPage = new PasswordPage()
const swapPage = new SwapPage()
const addCustomTokenPage = new AddCustomTokenPage()

let browser, page

const providerName = 'Jupiter'

describe('SOLANA swaps with Jupiter ["MAINNET"]', async () => {
  beforeEach(async () => {
    browser = await puppeteer.launch(testUtil.getChromeOptions())
    page = await browser.newPage()
    await page.goto(testUtil.extensionRootUrl, { waitUntil: 'load', timeout: 0 })

    // Import wallet option and accept Terms
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
  })
  afterEach(async () => {
    await browser.close()
  })

  it('SWAP SOL to soLINK and validate Jupiter quote [PULL_REQUEST_TEST]', async () => {
    const fromAsset = 'SOL'
    const toAsset = 'soLINK'

    // Click fromAsset
    await overviewPage.SelectAssetFromOverview(page, fromAsset)
    await page.waitForSelector('#' + fromAsset + '_swap_button', { visible: true })
    await page.click('#' + fromAsset + '_swap_button')
    console.log(`User clicked on ${fromAsset} SWAP button`)
    await page.waitForSelector('#swap_send_amount_input_field', { visible: true })
    console.log('SWAP screen has been displayed with send amount input field')

    // Select toAsset
    await page.click('.swap-receive-main-icon')
    await page.waitForSelector('#search_for_a_currency')
    await page.type('#search_for_a_currency', 'soLINK', { delay: 100 })
    console.log('User typed soLINK in search field')
    await page.waitForSelector('#LINK')
    await page.click('#LINK')
    console.log(`User selected ${toAsset} as 2nd pair for swap`)

    // Update the SWAP value to 0.1
    await swapPage.EnterSendAmountOnSwap(page, '0.1')

    // Verify Quote provider is displayed
    await page.waitForSelector('#selectedQuote_provider', {
      visible: true
    })
    const provider = await page.$eval('#selectedQuote_provider', (el) => el.innerText)
    expect(provider, `${fromAsset}->${toAsset} swap, ${providerName} should be chosen!`).to.equal(
      providerName
    )
  })

  it('SWAP SOL to CWAR(custom token) and validate Jupiter quote', async () => {
    const fromAsset = 'SOL'
    const toAsset = 'CWAR'

    const tokenDetails = {
      chain: 'solana',
      address: 'HfYFjMKNZygfMC8LsQ8LtpPsPxEJoXJx4M6tqi75Hajo',
      name: 'Cryowar Token',
      symbol: 'CWAR',
      decimal: '9'
    }
    // Click on add custom token option
    await overviewPage.ClickAddCustomToken(page)
    // Add Custom token screen
    await addCustomTokenPage.SelectChainDropdown(page, `${tokenDetails.chain}`)
    // paste address
    await addCustomTokenPage.EnterCustomTokenAddress(page, tokenDetails.address)
    // Validated the token details
    const fetchedTokenDetails = await addCustomTokenPage.GetTokenDetails(page)
    expect(fetchedTokenDetails.tokenName).to.equals(tokenDetails.name)
    expect(fetchedTokenDetails.tokenSymbol).to.equals(tokenDetails.symbol)
    expect(fetchedTokenDetails.tokenDecimal).to.equals(tokenDetails.decimal)
    // Click on Add Token button
    await addCustomTokenPage.AddTokenButton(page)

    //Click overview link
    await page.waitForSelector('.navbar_prev_icon')
    await page.click('.navbar_prev_icon')

    // Click fromAsset
    await overviewPage.SelectAssetFromOverview(page, fromAsset)
    await page.waitForSelector('#' + fromAsset + '_swap_button', { visible: true })
    await page.click('#' + fromAsset + '_swap_button')
    console.log(`User clicked on ${fromAsset} SWAP button`)
    await page.waitForSelector('#swap_send_amount_input_field', { visible: true })
    console.log('SWAP screen has been displayed with send amount input field')

    // Select toAsset
    await page.click('.swap-receive-main-icon')
    await page.waitForSelector('#search_for_a_currency')
    await page.type('#search_for_a_currency', 'CWAR')
    await page.waitForSelector(`#${toAsset}`, { timeout: 120000, visible: true })
    await page.click(`#${toAsset}`)
    console.log(`User selected ${toAsset} as 2nd pair for swap`)

    // Update the SWAP value to 0.1
    await swapPage.EnterSendAmountOnSwap(page, '0.1')

    // Verify Quote provider is displayed
    await page.waitForSelector('#selectedQuote_provider', {
      visible: true
    })
    const provider = await page.$eval('#selectedQuote_provider', (el) => el.innerText)
    expect(provider, `${fromAsset}->${toAsset} swap, ${providerName} should be chosen!`).to.equal(
      providerName
    )
  })

  it('SWAP SOL20 to SOL20 and validate Jupiter quote', async () => {
    const fromAsset = 'LINK'
    const toAsset = 'sUSDC'

    // Manage asset and enable LINK
    await overviewPage.ClickManageAssets(page)
    await page.waitForSelector('#search_for_an_assert_input', { visible: true })
    await page.type('#search_for_an_assert_input', fromAsset)
    await page.waitForSelector(`#${fromAsset}`, { visible: true })
    await page.click(`#${fromAsset}_toggle_button`)
    await page.click('#previous_nav_bar')

    // Search fromAsset
    await page.waitForSelector('#swap_action')
    await page.click('#swap_action')
    await page.waitForSelector('#search_for_a_currency_search')
    await page.type('#search_for_a_currency_search', 'soLINK')
    await page.waitForSelector(`#${fromAsset}`, { timeout: 120000, visible: true })
    await page.click(`#${fromAsset}`)
    console.log(`User selected ${fromAsset} as 1st pair for swap`)

    // Select toAsset
    await page.click('.swap-receive-main-icon')
    await page.waitForSelector('#search_for_a_currency')
    await page.type('#search_for_a_currency', toAsset)
    await page.waitForSelector(`#${toAsset}`, { timeout: 120000, visible: true })
    await page.click(`#${toAsset}`)
    console.log(`User selected ${toAsset} as 2nd pair for swap`)

    // Update the SWAP value to 0.1
    await swapPage.EnterSendAmountOnSwap(page, '0.1')

    // Verify Quote provider is displayed
    await page.waitForSelector('#selectedQuote_provider', {
      visible: true
    })
    const provider = await page.$eval('#selectedQuote_provider', (el) => el.innerText)
    expect(provider, `${fromAsset}->${toAsset} swap, ${providerName} should be chosen!`).to.equal(
      providerName
    )
  })
})
