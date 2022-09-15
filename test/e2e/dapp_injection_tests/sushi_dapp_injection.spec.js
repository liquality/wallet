const TestUtil = require("../../utils/TestUtils");
const OverviewPage = require("../../pages/OverviewPage");
const HomePage = require("../../pages/HomePage");
const PasswordPage = require("../../pages/PasswordPage");
const puppeteer = require("puppeteer");
const { expect } = require("chai");

const testUtil = new TestUtil();
const overviewPage = new OverviewPage();
const homePage = new HomePage();
const passwordPage = new PasswordPage();

let browser, page;
const metamaskTestDappUrl = "https://metamask.github.io/test-dapp/"

describe("Sushi Dapp Injection-['MAINNET','PULL_REQUEST_TEST']", async () => {
  beforeEach(async () => {
    browser = await puppeteer.launch(testUtil.getChromeOptions());
    page = await browser.newPage();
    await page.goto(testUtil.extensionRootUrl, { waitUntil: "load", timeout: 0 });
    // Import wallet option
    await homePage.ClickOnImportWallet(page);
    await homePage.ScrollToEndOfTerms(page);
    await homePage.ClickOnAcceptPrivacy(page);
    // Enter seed words and submit
    await homePage.EnterSeedWords(page);
    // Create a password & submit
    await passwordPage.SubmitPasswordDetails(page);
    // overview page
    await overviewPage.CloseWhatsNewModal(page);
    await overviewPage.HasOverviewPageLoaded(page);
  });
  afterEach(async () => {
    await browser.close();
  });

  it.only("Sushi injection - ETH", async () => {
    const dappPage = await browser.newPage();
    await dappPage.goto(metamaskTestDappUrl, { waitUntil: "load", timeout: 0 });
    dappPage.on("console", (msg) => {
      console.log("PAGE LOG:", msg.text());
    });
    console.log("Dapp page loaded");
    await dappPage.waitForNetworkIdle({ timeout: 0 });
    await dappPage.waitForSelector("#connectButton", { visible: true, timeout: 0})
    await dappPage.waitForSelector('.container-fluid', { visible: true, timeout: 0})
    console.log("metamask test dapp loaded")
    await testUtil.takeScreenshot(dappPage, "metamask-test-dapp")

    // await dappPage.waitForFunction('window.ethereum', { timeout: 0 })
    // await dappPage.evaluate(async () => {
    //   window.ethereum.enable().then(() => {
    //     console.log("window.ethereum.enable() called")
    //   })
    //   }, { timeout: 0 });
    const newPagePromise = new Promise((x) =>
      browser.once('targetcreated', (target) => x(target.page()))
    ) /* eslint-disable-line */

    await dappPage.click('#connectButton', { delay: 1000 })
    console.log("clicked connect button from metamask test dapp")

    dappPage.on("pageerror", function(err) {
      let theTempValue = err.toString();
      console.log("Page error: " + theTempValue);
    });

    dappPage.on("pageerror", function(err) {
      let theTempValue = err.toString();
      console.log("Page error: " + theTempValue);
    });

    const connectRequestWindow = await newPagePromise;
    try {
      await connectRequestWindow.waitForSelector("#filter_by_chain", {
        visible: true,
        timeout: 90000
      });
      await connectRequestWindow.click("#filter_by_chain");
      await connectRequestWindow.waitForSelector("#ethereum_web_network", { visible: true, timeout: 60000 });
      await connectRequestWindow.click("#ethereum_web_network");
    } catch (e) {
      await testUtil.takeScreenshot(connectRequestWindow, "sushi-ethereum-loading-issue");
      expect(e, "Sushi injection not listed, connected window not loaded.....").equals(null);
    }

    await connectRequestWindow.waitForSelector("#ETHEREUM", { visible: true, timeout: 60000 });
    // click Next button
    await connectRequestWindow.click("#connect_request_button");
    await connectRequestWindow.waitForSelector("#make_sure_you_trust_this_site", {
      visible: false,
      timeout: 60000
    });
    await connectRequestWindow.click("#connect_request_button");

    // Check web3 status as connected
    // await dappPage.waitForSelector("#connectButton", { visible: true, timeout: 30000})
    //   .catch((e) => expect(e, "Sushi dapp ETH chain injection not connected.....").to.not.throw());
    // await dappPage.click("#connectButton").catch((e) => e);
    await dappPage.waitForSelector('#accounts', { visible: true, timeout: 30000 })
      .catch((e) => expect(e, "Sushi dapp ETH chain injection not connected.....").to.not.throw());
    const connectedAddress = await dappPage.$eval('#accounts', (el) => el.innerText)
    expect(connectedAddress, "Sushi dapp ETH chain injection not connected.....").to.not.equal("");
    expect(connectedAddress, "Sushi dapp ETH chain injection not connected.....").to.not.null;
  });
  it.skip("Sushi injection - Polygon", async () => {
    let chain = "polygon";

    // Connected dapp option
    await page.click('#connect_dapp_main_option')
    await page.waitForSelector('#dropdown-item', { visible: true })
    // Select correct network
    await page.click("#dropdown-item", { delay: 1000 });
    await page.waitForSelector(`#${chain}_web_network`, { visible: true });
    await page.click(`#${chain}_web_network`, { delay: 2000 });
    await page.waitForTimeout(3000)

    const dappPage = await browser.newPage();
    await dappPage.goto(metamaskTestDappUrl, { waitUntil: "load", timeout: 0 });
    await dappPage.waitForSelector("#connectButton", { visible: true, timeout: 0})

    await dappPage.evaluate(async () => {
      window.ethereum.enable().then(() => {
        console.log("window.ethereum.enable() called")
      })
    });
    /* eslint-disable-line */
    const newPagePromise = new Promise((x) =>
      browser.once('targetcreated', (target) => x(target.page()))
    )
    const connectRequestWindow = await newPagePromise;
    await connectRequestWindow.waitForSelector("#filter_by_chain", {
      visible: true,
      timeout: 90000
    });
    await connectRequestWindow.click("#filter_by_chain").catch((e) => e);
    await connectRequestWindow.waitForSelector(`#${chain}_web_network`, { visible: true });
    await connectRequestWindow.click(`#${chain}_web_network`, { delay: 1000 });

    await connectRequestWindow.waitForSelector("#POLYGON", { visible: true });
    await connectRequestWindow.click("#POLYGON");
    // Check connect button is enabled
    await connectRequestWindow.click("#connect_request_button");
    await connectRequestWindow.waitForSelector("#make_sure_you_trust_this_site", {
      visible: false,
      timeout: 60000
    });
    // check origin url
    await connectRequestWindow
      .$eval("#origin_url", (el) => el.innerText)
      .then((text) => expect(text).to.contains("https://metamask.github.io"));
    await connectRequestWindow.click("#connect_request_button").catch((e) => e);
    // Check web3 status as connected
    await dappPage.waitForSelector("#connectButton", { visible: true, timeout: 30000})
      .catch((e) => expect(e, "Sushi dapp polygon chain injection not connected.....").to.not.throw());
    await dappPage.click("#connectButton");
    await dappPage.waitForSelector('#accounts', { visible: true, timeout: 30000 })
      .catch((e) => expect(e, "Sushi dapp polygon chain injection not connected.....").to.not.throw());
    const connectedAddress = await dappPage.$eval('#accounts', (el) => el.innerText)
    expect(connectedAddress, "Sushi dapp polygon chain injection not connected.....").to.not.equal("");
    expect(connectedAddress, "Sushi dapp polygon chain injection not connected.....").to.not.null;
  });
});
