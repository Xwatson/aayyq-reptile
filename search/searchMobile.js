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
        let detail = {}
        const movieBody = await content.findElement(By.id('resize_vod'))
        const infoBody = await movieBody.findElement(By.className('vod-n-l'))
        detail.title = (await infoBody.findElement(By.tagName('h1')).getText()).replace(/\n|/g, '').trim()
        const infos = await infoBody.findElements(By.tagName('p'))
        detail.status = (await infos[0].getText()).replace(/\n|状态：/g, '')
        detail.starring = (await infos[1].getText()).replace(/\n|主演：/g, '')
        detail.type = (await infos[2].getText()).replace(/\n|类型：/g, '')
        detail.director = (await infos[3].getText()).replace(/\n|导演：/g, '')
        detail.area = (await infos[4].getText()).replace(/\n|地区：/g, '')
        detail.updateTime = (await infos[5].getText()).replace(/\n|更新：/g, '')
        detail.updateTime = moment(`20${detail.updateTime}`).format('YYYY-MM-DD HH:mm:ss')
        const playTabs = await content.findElement(By.className('vod-play-tab')).findElements(By.tagName('li'))
        await playTabs[1].findElement(By.tagName('span')).click()
        await this.driver.wait(until.elementIsVisible(content.findElement(By.id('con_vod_2'))), 3000)
        const plot = await content.findElement(By.id('con_vod_2')).getText()
        detail.plot = plot.replace(/\n|/g, '')
        await movieBody.findElement(By.className('vod_play')).findElement(By.tagName('a')).click()
        await this.driver.sleep(1000)
        await this.driver.switchTo().frame(1)
        await this.driver.wait(until.elementLocated(By.id('J_miPlayerWrapper')), 1000*60)
        detail.playerUrl = await this.driver.findElement(By.id('J_miPlayerWrapper')).findElement(By.tagName('video')).getAttribute('src')
        return detail
        
    }
}

module.exports = search