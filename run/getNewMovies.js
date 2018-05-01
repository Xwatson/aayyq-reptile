'use strict';

const fetch = require('whatwg-fetch');
const {Builder, By, Key, until} = require('selenium-webdriver');
const {Options} = require('selenium-webdriver/chrome');
const { HOST } = require('../common/common');
const getProxy = require('../common/getProxy');
const SearchMobile = require('../search/searchMobile');
const HomeMobile = require('../home/homeMobile');
const proxy = require('selenium-webdriver/proxy');

(async function() {
    let driver = null
    const width = 1;
    const height = 1;
    const proxys = await getProxy();
    let proxyIndex = 0
    try {
        const build = await new Builder()
        .forBrowser('chrome')
        .setChromeOptions(
            new Options().setMobileEmulation({deviceName: 'Nexus 5X'}))
        /* .setChromeOptions(
            new chrome.Options().headless().windowSize({width, height})); */
        const loopProxy = async() => {
            await build.setProxy(proxy.manual({
                http: `${proxys[proxyIndex].ip}:${proxys[proxyIndex].port}`,
                bypass: null //I tried null,"",undefined,[],[""]
            }));
            driver = await build.build();
            await driver.get('http://c.aaccy.com');
            if (!/YY4480影院官网/.test(await driver.getTitle())) {
                console.log(`代理：${proxys[proxyIndex].ip}:${proxys[proxyIndex].port}-${proxys[proxyIndex].city} 不可用，正在切换...`)
                await driver.quit();
                proxyIndex++;
                if (proxyIndex > proxys.length) {
                    throw new Error('无可用代理IP')
                }
                return await loopProxy()
            }
            console.log('正在使用代理：', `${proxys[proxyIndex].ip}:${proxys[proxyIndex].port}-${proxys[proxyIndex].city}`)
            const home = new HomeMobile(driver)
            const movies = await home.getNewMovie()
            fetch('http://127.0.0.1:8360/api/movies/put', {
                method: 'PUT',
                body: new FormData({ batchData: JSON.stringify(movies) })
            }).then(function(response) {
                return response.json()
            }).then(function(data) {
                console.log('parsed json', data)
            }).catch(function(ex) {
                console.log('parsing failed', ex)
            })
        }
        if (proxys.length) {
            await loopProxy()
        } else {
            throw new Error('未获取到代理IP')
        }
        
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
