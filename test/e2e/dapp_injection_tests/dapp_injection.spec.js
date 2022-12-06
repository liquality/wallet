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

describe("Dapp Injection-['MAINNET','PULL_REQUEST_TEST']", async () => {
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

  it("Dapp injection - ETH", async () => {
    const metaMaskTestDapp = await browser.newPage();
    await metaMaskTestDapp.goto(metamaskTestDappUrl, { waitUntil: "load", timeout: 0 });
    await metaMaskTestDapp.waitForSelector("#connectButton", { visible: true, timeout: 0})
    console.log("Metmask test dapp loaded with connect button");
    await testUtil.takeScreenshot(metaMaskTestDapp, "metamask-test-dapp-before-connect")

    await metaMaskTestDapp.click("#connectButton");
    await metaMaskTestDapp.waitForTimeout(2000);
    let sizeOfWindow = await browser.pages();

    if (sizeOfWindow.length > 1) {
      console.log("Metamask popup detected");
      const connectRequestWindow = (await browser.pages())[3];
      let pageTitle = await connectRequestWindow.title();
      console.log("Page title is: ", pageTitle);
      expect(pageTitle,'Liquality wallet page title is wrong clicked metamask connect button').to.equal("Liquality Wallet");
      await connectRequestWindow.waitForSelector("#filter_by_chain", {
        visible: true,
        timeout: 90000
      });
      await connectRequestWindow.click("#filter_by_chain");
      await connectRequestWindow.waitForSelector("#ethereum_web_network", { visible: true, timeout: 60000 });
      await connectRequestWindow.click("#ethereum_web_network");
      await connectRequestWindow.waitForSelector("#ETHEREUM", { visible: true, timeout: 60000 });
      // click Next button
      await connectRequestWindow.click("#connect_request_button");
      await connectRequestWindow.waitForSelector("#make_sure_you_trust_this_site", {
        visible: false,
        timeout: 60000
      });
      await connectRequestWindow.click("#connect_request_button");
      console.log("user clicked on connect button");

      // Check web3 status as connected
      await metaMaskTestDapp.waitForSelector('#accounts', { visible: true})
      console.log("Metamask test dapp loaded with accounts success message, checking the address is correct");
      const connectedAddress = await metaMaskTestDapp.$eval('#accounts', (el) => el.innerText)
      console.log("Metamask dap test connected address: ", connectedAddress);
      expect(connectedAddress, "Sushi dapp ETH chain injection account address shouldn't be null.....").to.not.equal("");
      expect(connectedAddress, "Sushi dapp ETH chain injection account address shouldn't be null.....").to.not.null;
    }
  });
  it("Dapp test app injection - Polygon", async () => {
    let chain = "polygon";

    // Connected dapp option
    await page.click('#connect_dapp_main_option')
    await page.waitForSelector('#dropdown-item', { visible: true })
    // Select correct network
    await page.click("#dropdown-item", { delay: 1000 });
    await page.waitForSelector(`#${chain}_web_network`, { visible: true });
    await page.click(`#${chain}_web_network`, { delay: 2000 });
    await page.waitForTimeout(3000);

    const metaMaskTestDapp = await browser.newPage();
    await metaMaskTestDapp.goto(metamaskTestDappUrl, { waitUntil: "load", timeout: 0 });
    await metaMaskTestDapp.waitForSelector("#connectButton", { visible: true, timeout: 0})
    console.log("Metmask test dapp loaded with connect button");

    await metaMaskTestDapp.click("#connectButton");
    console.log("Metmask test dapp connect button clicked");
    await metaMaskTestDapp.waitForTimeout(5000);
    let sizeOfWindow = await browser.pages();
    expect(sizeOfWindow.length, "Metamask popup not detected").to.equal(4);

    if (sizeOfWindow.length > 1) {
      console.log("Metamask popup detected");
      const connectRequestWindow = (await browser.pages())[3];
      let pageTitle = await connectRequestWindow.title();
      let pageUrl = await connectRequestWindow.url();
      console.log("Page title is: ", pageTitle);
      console.log("Page url is: ", pageUrl);
      await connectRequestWindow.waitForSelector("#filter_by_chain", {
        visible: true,
        timeout: 90000
      });
      await connectRequestWindow.click("#filter_by_chain").catch((e) => e);
      await connectRequestWindow.waitForSelector(`#${chain}_web_network`, { visible: true });
      await connectRequestWindow.click(`#${chain}_web_network`, { delay: 1000 });
      console.log("user clicked on polygon web network connect button");

      await connectRequestWindow.waitForSelector("#POLYGON", { visible: true });
      await connectRequestWindow.click("#POLYGON");
      // click Next button
      await connectRequestWindow.click("#connect_request_button");
      await connectRequestWindow.waitForSelector("#make_sure_you_trust_this_site", {
        visible: false,
        timeout: 60000
      });
      await connectRequestWindow.click("#connect_request_button");
      console.log("user clicked on connect button from liquality wallet");

      // Check web3 status as connected
      await metaMaskTestDapp.waitForSelector('#accounts', { visible: true, timeout: 30000 })
      await metaMaskTestDapp.waitForTimeout(3000);
      const connectedAddress = await metaMaskTestDapp.$eval('#accounts', (el) => el.innerText)
      console.log("polygon Connected address: ", connectedAddress);
      expect(connectedAddress, "Sushi dapp polygon chain injection not connected.....").to.not.equal("");
      expect(connectedAddress, "Sushi dapp polygon chain injection not connected.....").to.not.null;
    }
  });
});
