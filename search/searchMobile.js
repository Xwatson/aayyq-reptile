const { switchFrame, sendSearchByMobile, HOST } = require('../common/common');
const { By, Key, until } = require('selenium-webdriver');
const moment = require('moment');

class search {
    constructor(driver) {
        this.driver = driver
        this.keyWords = ''
    }
    async search(keyWords) {
        this.keyWords = keyWords
        await sendSearchByMobile(this.driver, keyWords)
        await this.driver.sleep(1000)
        try {
            const resizeList = await this.driver.wait(until.elementLocated(By.className('list_info')), 3000)
        } catch(e) {
            throw new Error('错误：搜索内容【'+ keyWords +'】不在收录中')
        }
        return await this.goToDetail(await this.driver.findElement(By.id('resize_list')))
    }
    async goToDetail(contents) {
        let list = await contents.findElements(By.tagName('li'))
        for(let item in list) {
            let playTxt = await list[item].findElement(By.className('list_info'))
            let title = await playTxt.findElement(By.tagName('h2'))
            let text = await title.getText()
            if (text.indexOf(this.keyWords) > -1) {
                await title.findElement(By.tagName('a')).click()
                break;
            }
        }
        await this.driver.sleep(2000)
        // await switchFrame(this.driver)
        const detailContent = await this.driver.findElement(By.tagName('body'))
        return await this.getDetail(detailContent)
    }
    async getDetail(content) {
        let mgtvUrl = null,
            mgtvIndex = -1
        const playerSource_DC = await content.findElement(By.id('con_vod_1'))
        const playTitles = await playerSource_DC.findElements(By.className('play-title'))
        let index = 0
        for (let item in playTitles) {
            let playTvText = await playTitles[item].getText()
            if (playTvText.indexOf('芒芒TV') > -1) {
                mgtvIndex = index
                break
            }
            index++
        }
        if (mgtvIndex > -1) {
            let mgtvBox_DC = await playerSource_DC.findElements(By.className('play-box'))
            let mgtvs_DC = await mgtvBox_DC[mgtvIndex].findElement(By.className('plau-ul-list')).findElements(By.tagName('li'))
            for(let item in mgtvs_DC) {
                let mgtv_text = await mgtvs_DC[item].getText()
                if (mgtv_text.indexOf('在线观看') > -1) {
                    await mgtvs_DC[item].findElement(By.tagName('a')).click()
                    break
                }
            }
            await this.driver.sleep(2000)
            await this.driver.switchTo().frame(1)
            await this.driver.wait(until.elementLocated(By.id('J_miPlayerWrapper')), 1000*60)
            mgtvUrl = await this.driver.findElement(By.id('J_miPlayerWrapper')).findElement(By.tagName('video')).getAttribute('src')
        }
        return mgtvUrl
    }
}

module.exports = search