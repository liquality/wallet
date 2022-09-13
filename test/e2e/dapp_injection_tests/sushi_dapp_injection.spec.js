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
const dappUrl = "https://app.sushi.com";

describe("Sushi Dapp Injection-['MAINNET']", async () => {
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

  it("Sushi injection - ETH['PULL_REQUEST_TEST']", async () => {
    const dappPage = await browser.newPage();
    await dappPage.goto(dappUrl, { waitUntil: "networkidle2", timeout: 0 });
    await dappPage.waitForSelector("#connect-wallet", { visible: true, timeout: 90000 });
    await dappPage.click("#connect-wallet");
    // Before click on injected wallet option.
    const newPagePromise = new Promise((x) =>
      browser.once("targetcreated", (target) => x(target.page()))
    ); /* eslint-disable-line */
    // Click on Injected Option
    const injectedOption = await dappPage.$x("//*[text()='Injected']");
    injectedOption[0].click();

    const connectRequestWindow = await newPagePromise;
    try {
      await connectRequestWindow.waitForSelector("#filter_by_chain", {
        visible: true,
        timeout: 90000
      });
      await connectRequestWindow.waitForSelector("#ETHEREUM", { visible: true, timeout: 60000 });
    } catch (e) {
      await testUtil.takeScreenshot(connectRequestWindow, "sushi-ethereum-loading-issue");
      expect(e, "Sushi injection not listed, connected window not loaded.....").equals(null);
    }
    await connectRequestWindow.waitForSelector("#dropdown-item", { visible: true });
    let filterValues = await connectRequestWindow.evaluate(() => {
      const dropdownItems = document.querySelectorAll("#dropdown-item");
      const filterValues = [];
      for (let i = 0; i < dropdownItems.length; i++) {
        filterValues.push(dropdownItems[i].innerText);
      }
      return filterValues;
    });
    expect(
      filterValues,
      "Sushiswap injection ethereum not listed, connected window not loaded....."
    ).to.include("Ethereum (ETH)");
    // click Next button
    await connectRequestWindow.click("#connect_request_button").catch((e) => e);
    await connectRequestWindow.waitForSelector("#make_sure_you_trust_this_site", {
      visible: false,
      timeout: 60000
    });
    await connectRequestWindow.click("#connect_request_button").catch((e) => e);

    // Check web3 status as connected
    await dappPage.waitForSelector("#web3-status-connected", { visible: true, timeout: 30000})
      .catch((e) => expect(e, "Sushi dapp ETH chain injection not connected.....").to.not.throw());
  });
  it("Sushi injection - Polygon", async () => {
    let chain = "polygon";

    // Select correct network
    await page.click("#dropdown-item", { delay: 1000 });
    await page.waitForSelector(`#${chain}_web_network`, { visible: true });
    await page.click(`#${chain}_web_network`, { delay: 2000 });

    const dappPage = await browser.newPage();
    await dappPage.goto(dappUrl, { waitUntil: "networkidle2" });
    await dappPage.waitForSelector("#connect-wallet", { visible: true, timeout: 90000 });
    await dappPage.click("#connect-wallet");
    // Before click on injected wallet option.
    const newPagePromise = new Promise((x) =>
      browser.once("targetcreated", (target) => x(target.page()))
    ); /* eslint-disable-line */
    // Click on Injected Option
    const injectedOption = await dappPage.$x("//*[text()='Injected']");
    injectedOption[0].click();

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
    await connectRequestWindow.click("#connect_request_button").catch((e) => e);
    await connectRequestWindow.waitForSelector("#make_sure_you_trust_this_site", {
      visible: false,
      timeout: 60000
    });
    // check origin url
    await connectRequestWindow
      .$eval("#origin_url", (el) => el.innerText)
      .then((text) => expect(text).to.contains(dappUrl));
    await connectRequestWindow.click("#connect_request_button").catch((e) => e);
    // Check web3 status as connected
    await dappPage.waitForSelector("#web3-status-connected", { visible: true, timeout: 30000})
      .catch((e) => expect(e, "Sushi dapp ETH chain injection not connected.....").to.not.throw());
  });
});
