'use strict';

const {Builder, By, Key, until} = require('selenium-webdriver');
const {Options} = require('selenium-webdriver/chrome');
const { HOST } = require('./common/common');
const Search = require('./search/search');

(async function() {
    let driver = null
    try {
      driver = await new Builder()
        .forBrowser('chrome')
        /* .setChromeOptions(
            new Options().setMobileEmulation({deviceName: 'Nexus 5X'})) */
        .build();
        await driver.get(HOST);
        const search = new Search(driver)
        let list = await search.search('捉妖记2')
        console.log('搜索结果->', list)
    } finally {
        // await driver && driver.quit();
    }
/* 
    let menuHtml = await driver.findElement(By.id('i_div0_0')).getAttribute("innerHTML")
    let $ = cheerio.load(menuHtml)
    $('table').each(function() {
        console.log('-->', $(this).text())
    }) */
})().then(_ => console.log('SUCCESS'), err => console.error('ERROR: ' + err));
