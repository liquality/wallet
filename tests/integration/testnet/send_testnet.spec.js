const TestUtil = require('../../utils/TestUtils')
const OverviewPage = require('../Pages/OverviewPage')
const HomePage = require('../Pages/HomePage')
const PasswordPage = require('../Pages/PasswordPage')
const TestDataUtils = require('../../utils/TestDataUtils')

const puppeteer = require('puppeteer')
const log = console.log
const expect = require('chai').expect
const chalk = require('chalk')

const testUtil = new TestUtil()
const testDataUtils = new TestDataUtils()
const overviewPage = new OverviewPage()
const homePage = new HomePage()
const passwordPage = new PasswordPage()

let browser
let page
const password = '123123123'

// Chrome options
const options = {
  slowMo: 20,
  headless: false,
  ignoreHTTPSErrors: true,
  executablePath: process.env.PUPPETEER_EXEC_PATH,
  args: [
    '--no-sandbox',
    '--disabled-setupid-sandbox',
    '--disable-extensions-except=' + testUtil.extensionPathBuildPath,
    '--load-extension=' + testUtil.extensionPathBuildPath
  ]
}
describe('Liquality wallet SEND feature', async () => {
  beforeEach(async () => {
    browser = await puppeteer.launch(options)
    page = await browser.newPage()
    await page.goto(testUtil.extensionRootUrl)
    await homePage.ClickOnAcceptPrivacy(page)
  })

  afterEach(async () => {
    await browser.close()
  })

  it('Send BTC to another Wrong address. check Review option has been disabled', async () => {
    const importWithSeedOptionElement = await page.waitForSelector('#import_with_seed_phrase_option', {
      visible: true
    })
    await importWithSeedOptionElement.click()
    console.log('Import with seed phrase option has been displayed')
    await page.waitForSelector('#import-wallet_top', {
      visible: true
    })
    console.log('Import wallet page hase been loaded')
    // Get the existing SEED words as environment variables
    let words
    const SEED_WORDS = process.env.SEED_WORDS
    if (!SEED_WORDS) {
      throw new Error('Please provide SEED_WORDS as environment variables')
    } else {
      words = SEED_WORDS.split(' ')
    }

    const seedsWordsCount = await page.$$('#import_wallet_word')
    for (let i = 0; i < seedsWordsCount.length; i++) {
      const wordInput = seedsWordsCount[i]
      await wordInput.type(words[i])
    }

    // Click on continue button
    await page.click('#import_wallet_continue_button')
    console.log('Import wallet continue button has been clicked')

    // Create a password & submit
    await passwordPage.SubmitPasswordDetails(page, password)

    // overview page
    await overviewPage.HasOverviewPageLoaded(page)

    await page.click('#head_network')
    await page.waitForSelector('#testnet_network', {
      visible: true
    })
    console.log('user successfully logged in after import wallet')

    await page.click('#testnet_network')
    const overviewText = await page.$eval('.text-muted', el => el.innerText)
    expect(overviewText, 'Testnet overview header').contain('TESTNET')
    console.log('user successfully changed to TESTNET')

    // check Send & Swap & Receive options have been displayed
    await page.waitForSelector('#send_action', {
      visible: true
    })
    await page.waitForSelector('#swap_action', {
      visible: true
    })
    await page.waitForSelector('#receive_action', {
      visible: true
    })

    // Click on SEND Option
    await page.click('#send_action')
    await page.waitForSelector('#search_for_a_currency_search', {
      visible: true
    })

    // SEND from assert (BTC)
    await page.type('#search_for_a_currency_search', 'BTC')
    await page.waitForTimeout(2000)
    const assertListItems = await page.$$('#assert_list_item')
    await assertListItems[0].click()
    expect(await page.$eval('#overview', el => el.innerText), 'SEND page not loaded correctly')
      .equals('SEND')
    // Enter send amount (or) coins
    await page.type('#send_amount_input_field', '0.000001')
    // Send address
    await page.type('#address', '0x172E90C757c66f0d93E96165FDb7B3c03337Be6A')
    await page.waitForSelector('#address_format_error', { visible: true })
    expect(await page.$eval('#address_format_error', el => el.innerText)).equals('Wrong format. Please check the address.')

    // Check Send Review option has been disabled
    expect(await page.$('#send_review_button[disabled]'), 'Send Review Button should be disabled if address wrong format')
      .not.to.equal(null)
    log(chalk.green.underline.bold('Send Review Button disabled if address wrong format'))
  })
  it('Send BTC to another address,Lower amount. This exceeds available balance.', async () => {
    const importWithSeedOptionElement = await page.waitForSelector('#import_with_seed_phrase_option', {
      visible: true
    })
    await importWithSeedOptionElement.click()
    console.log('Import with seed phrase option has been displayed')
    await page.waitForSelector('#import-wallet_top', {
      visible: true
    })
    console.log('Import wallet page hase been loaded')
    // Get the existing SEED words as environment variables
    let words
    const SEED_WORDS = process.env.SEED_WORDS
    if (!SEED_WORDS) {
      throw new Error('Please provide SEED_WORDS as environment variables')
    } else {
      words = SEED_WORDS.split(' ')
    }

    const seedsWordsCount = await page.$$('#import_wallet_word')
    for (let i = 0; i < seedsWordsCount.length; i++) {
      const wordInput = seedsWordsCount[i]
      await wordInput.type(words[i])
    }

    // Click on continue button
    await page.click('#import_wallet_continue_button')
    console.log('Import wallet continue button has been clicked')

    // Create a password & submit
    await passwordPage.SubmitPasswordDetails(page, password)

    // overview page
    await overviewPage.HasOverviewPageLoaded(page)

    await page.click('#head_network')
    await page.waitForSelector('#testnet_network', {
      visible: true
    })
    console.log('user successfully logged in after import wallet')

    await page.click('#testnet_network')
    const overviewText = await page.$eval('.text-muted', el => el.innerText)
    expect(overviewText, 'Testnet overview header').contain('TESTNET')
    console.log('user successfully changed to TESTNET')

    // check Send & Swap & Receive options have been displayed
    await page.waitForSelector('#send_action', {
      visible: true
    })
    await page.waitForSelector('#swap_action', {
      visible: true
    })
    await page.waitForSelector('#receive_action', {
      visible: true
    })

    // Click on SEND Option
    await page.click('#send_action')
    await page.waitForSelector('#search_for_a_currency_search', {
      visible: true
    })

    // SEND from assert (BTC)
    await page.type('#search_for_a_currency_search', 'BTC')
    await page.waitForTimeout(2000)
    const assertListItems = await page.$$('#assert_list_item')
    await assertListItems[0].click()
    expect(await page.$eval('#overview', el => el.innerText), 'SEND page not loaded correctly')
      .equals('SEND')

    // Enter send amount (or) coins
    await page.type('#send_amount_input_field', '10')
    await page.waitForSelector('.send-main-errors', { visible: true })
    expect(await page.$eval('.send-main-errors', el => el.innerText))
      .equals('Lower amount. This exceeds available balance.')
    console.log(chalk.greenBright('Lower amount. This exceeds available balance.'))

    // Send address
    await page.type('#address', '0x32Be343B94f860124dC4fEe278FDCBD38C102D88')

    // Check Send Review option has been disabled
    expect(await page.$('#send_review_button[disabled]'), 'Send Review Button should be disabled if address wrong format')
      .not.to.equal(null)
    log(chalk.green.underline.bold('Send Review Button disabled if amount is exceeds'))
  })
  it('Send SOV to random ETH address', async () => {
    const sovryan = 'SOV'
    const coinsToSend = '1'

    const importWithSeedOptionElement = await page.waitForSelector('#import_with_seed_phrase_option', {
      visible: true
    })
    await importWithSeedOptionElement.click()
    console.log('Import with seed phrase option has been displayed')
    await page.waitForSelector('#import-wallet_top', {
      visible: true
    })
    console.log('Import wallet page hase been loaded')
    // Get the existing SEED words as environment variables
    let words
    const SEED_WORDS = process.env.SEED_WORDS
    if (!SEED_WORDS) {
      throw new Error('Please provide SEED_WORDS as environment variables')
    } else {
      words = SEED_WORDS.split(' ')
    }

    const seedsWordsCount = await page.$$('#import_wallet_word')
    for (let i = 0; i < seedsWordsCount.length; i++) {
      const wordInput = seedsWordsCount[i]
      await wordInput.type(words[i])
    }

    // Click on continue button
    await page.click('#import_wallet_continue_button')
    console.log('Import wallet continue button has been clicked')

    // Create a password & submit
    await passwordPage.SubmitPasswordDetails(page, password)

    // overview page
    await overviewPage.HasOverviewPageLoaded(page)

    await page.click('#head_network')
    await page.waitForSelector('#testnet_network', {
      visible: true
    })
    console.log('user successfully logged in after import wallet')

    await page.click('#testnet_network')
    const overviewText = await page.$eval('.text-muted', el => el.innerText)
    expect(overviewText, 'Testnet overview header').contain('TESTNET')
    console.log('user successfully changed to TESTNET')

    // check Send & Swap & Receive options have been displayed
    await page.waitForSelector('#send_action', {
      visible: true
    })
    await page.waitForSelector('#swap_action', {
      visible: true
    })
    await page.waitForSelector('#receive_action', {
      visible: true
    })

    // Click on SEND Option
    await page.click('#send_action')
    await page.waitForSelector('#search_for_a_currency_search', {
      visible: true
    })

    // SEND
    await page.type('#search_for_a_currency_search', sovryan)
    await page.waitForTimeout(2000)
    const assertListItems = await page.$$('#assert_list_item')
    await assertListItems[0].click()
    await page.click('#' + sovryan)
    expect(await page.$eval('#overview', el => el.innerText), 'SEND page not loaded correctly')
      .equals('SEND')

    // Enter send amount (or) coins
    await page.type('#send_amount_input_field', coinsToSend)

    // Send address
    const ethAddress = testDataUtils.getRandomEthereumAddress()
    await page.type('#address', ethAddress)

    // Click Review Button
    await page.click('#send_review_button')

    await page.waitForSelector('#send_button_confirm', { visible: true })
    await page.click('#send_button_confirm')
    await page.waitForSelector('.transaction-list', { visible: true })
    await page.waitForSelector('.list-item-detail-icon', { visible: true })
    await page.click('.list-item-detail-icon')

    // Transaction details page
    await page.waitForSelector('#transaction_detail_sent_amount', { visible: true })
    const sentAmount = await page.$eval('#transaction_detail_sent_amount', el => el.innerText)
    expect(sentAmount.toString().trim()).equals('1 SOV')
    await page.waitForSelector('#transaction_details_send_to_link', { visible: true })
    const sedToHrefLink = await page.$eval('#transaction_details_send_to_link', el => el.href)
    expect(sedToHrefLink).contain('https://explorer.testnet.rsk.co/address')
    await page.waitForSelector('#transaction_details_network_speed_fee', { visible: true })
    await page.waitForSelector('#transaction_details_date_time', { visible: true })
    // TODO: add timer here to validate the status is Completed
    await page.waitForSelector('#transaction_details_status', { visible: true })
    await page.waitForSelector('#transaction_details_transaction_id', { visible: true })
    const transactionIdHrefLink = await page.$eval('#transactionLink', el => el.href)
    expect(transactionIdHrefLink).contain('https://explorer.testnet.rsk.co/tx')
  })
})
