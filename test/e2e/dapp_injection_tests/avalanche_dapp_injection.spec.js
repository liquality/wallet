const TestUtil = require('../../utils/TestUtils')
const OverviewPage = require('../../pages/OverviewPage')
const HomePage = require('../../pages/HomePage')
const PasswordPage = require('../../pages/PasswordPage')
const puppeteer = require('puppeteer')
const { expect } = require('chai')

const testUtil = new TestUtil()
const overviewPage = new OverviewPage()
const homePage = new HomePage()
const passwordPage = new PasswordPage()

let browser, page, dappPage
const metamaskTestDappUrl = "https://metamask.github.io/test-dapp/"
const chainId = 43114
const expectedAddress = '0x3f429e2212718a717bd7f9e83ca47dab7956447b'

describe('Avalanche Dapp injection-["MAINNET","PULL_REQUEST_TEST"]', async () => {
  beforeEach(async () => {
    browser = await puppeteer.launch(testUtil.getChromeOptions())
    page = await browser.newPage()
    await page.setDefaultNavigationTimeout(0)
    await page.goto(testUtil.extensionRootUrl, { waitUntil: 'load', timeout: 0 })
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
    // Default web3 option toggled on
    await overviewPage.CheckWeb3ToggleOn(page)
    // Connected dapp option
    await page.click('#connect_dapp_main_option')
    await page.waitForSelector('.v-switch-core', { visible: true })

    await page.click('#dropdown-item', { delay: 1000 })
    await page.waitForSelector('#avalanche_web_network', { visible: true })
    await page.click('#avalanche_web_network', { delay: 1000 })
    await page.waitForTimeout(3000)

    // Go to dpp app
    dappPage = await browser.newPage()
    await dappPage.setViewport({
      width: 1366,
      height: 768
    })
  })
  it('Avalanche pangolin Exchange dapp injection', async () => {
    let chain = "avalanche";

    await dappPage.goto(metamaskTestDappUrl, { timeout: 0, waitUntil: 'load' })
    // Before click on injected wallet option.
    await dappPage.evaluate(async () => {
      window.ethereum.enable()
    })
    const newPagePromise = new Promise((x) =>
      browser.once('targetcreated', (target) => x(target.page()))
    ) /* eslint-disable-line */
    const connectRequestWindow = await newPagePromise;
    await connectRequestWindow.waitForSelector("#filter_by_chain", {
      visible: true,
      timeout: 90000
    });
    await connectRequestWindow.click("#filter_by_chain").catch((e) => e);
    await connectRequestWindow.waitForSelector(`#${chain}_web_network`, { visible: true });
    await connectRequestWindow.click(`#${chain}_web_network`, { delay: 1000 });

    await connectRequestWindow.waitForSelector("#AVALANCHE", { visible: true });
    await connectRequestWindow.click("#AVALANCHE");
    // Check connect button is enabled
    await connectRequestWindow.click("#connect_request_button").catch((e) => e);
    await connectRequestWindow.waitForSelector("#make_sure_you_trust_this_site", {
      visible: false,
      timeout: 60000
    });
    await connectRequestWindow.click('#connect_request_button')
    await dappPage.waitForSelector("#connectButton", { visible: true, timeout: 30000})
      .catch((e) => expect(e, "Sushi dapp polygon chain injection not connected.....").to.not.throw());
    await dappPage.click("#connectButton");
    await dappPage.waitForSelector('#accounts', { visible: true, timeout: 30000 })
      .catch((e) => expect(e, "Sushi dapp polygon chain injection not connected.....").to.not.throw());
    const connectedAddress = await dappPage.$eval('#accounts', (el) => el.innerText)
    expect(connectedAddress, "Sushi dapp polygon chain injection not connected.....").to.not.equal("");
    expect(connectedAddress, "Sushi dapp polygon chain injection not connected.....").to.not.null;

    // Check web3 status as connected against dapp Ui.
    const connectedChainDetails = await dappPage.evaluate(async () => {
      const chainIDHexadecimal = await window.ethereum.request({
        method: 'eth_chainId',
        params: []
      })
      return {
        chainId: parseInt(chainIDHexadecimal, 16),
        connectedAddress: await window.ethereum.request({ method: 'eth_accounts' })
      }
    })
    console.log('connectedChainDetails', connectedChainDetails)
    expect(
      connectedChainDetails.chainId,
      'Avalanche chain ID is not expected after dapp connection'
    ).equals(chainId)
    expect(
      connectedChainDetails.connectedAddress[0].toLowerCase(),
      'Avalanche connected address is not expected after dapp connection'
    ).equals(expectedAddress.toLowerCase())

    await page.bringToFront()
  })

  afterEach(async () => {
    await browser.close()
  })
})
