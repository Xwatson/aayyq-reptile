'use strict';

const {Builder, By, Key, until} = require('selenium-webdriver');
const {Options} = require('selenium-webdriver/chrome');
const { HOST } = require('./common/common');
const SearchMobile = require('./search/searchMobile');
const HomeMobile = require('./home/homeMobile');

(async function() {
    let driver = null
    try {
      driver = await new Builder()
        .forBrowser('chrome')
        .setChromeOptions(
            new Options().setMobileEmulation({deviceName: 'Nexus 5X'}))
        .build();
        await driver.get(HOST);
        const search = new SearchMobile(driver)
        let url = await search.search('不一样的锦衣卫')
        console.log('搜索结果->', url)
        /* const home = new HomeMobile(driver)
        console.log('搜索结果->', await home.getNewMovie()) */
    } finally {
        await driver && driver.quit();
    }
/* 
    let menuHtml = await driver.findElement(By.id('i_div0_0')).getAttribute("innerHTML")
    let $ = cheerio.load(menuHtml)
    $('table').each(function() {
        console.log('-->', $(this).text())
    }) */
})().then(_ => console.log('SUCCESS'), err => console.error('ERROR: ' + err));
