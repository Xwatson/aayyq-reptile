const { switchFrame, sendSearch, HOST } = require('../common/common');
const { By, Key, until } = require('selenium-webdriver');
const cheerio = require('cheerio');
const moment = require('moment');

class search {
    constructor(driver) {
        this.driver = driver
        this.keyWords = ''
    }
    async search(keyWords) {
        this.keyWords = keyWords
        await this.driver.sleep(1000)
        let mainBody = await switchFrame(this.driver)
        this.driver.sleep(1000)
        // 发送搜索
        await sendSearch(mainBody, keyWords) 
        this.driver.sleep(2000)
        mainBody = await switchFrame(this.driver)
        // let searchList = await mainBody.findElement(By.id('contents')).getAttribute("innerHTML")
        // return this.getList(searchList)
        return await this.goToDetail(await mainBody.findElement(By.id('contents')))
    }
    async goToDetail(contents) {
        let list = await contents.findElements(By.tagName('li'))
        for(let item in list) {
            let playTxt = await list[item].findElement(By.className('play-txt'))
            let title = await playTxt.findElement(By.tagName('h5'))
            let text = await title.getText()
            if (text.indexOf(this.keyWords) > -1) {
                await title.findElement(By.tagName('a')).click()
                break;
            }
        }
        await this.driver.sleep(3000)
        await switchFrame(this.driver)
        let detailContent = await this.driver.findElement(By.id('content'))
        return await this.getDetail(detailContent, await detailContent.getAttribute("innerHTML"))
    }
    async getDetail(content, innerHTML) {
        const $ = cheerio.load(innerHTML)
        const $detailBox = $('#detail-box')
        const $infos = $detailBox.find('.info dl')
        let detail = {}
        detail.title = $detailBox.find('h2').text() // 标题
        detail.starring = $infos.eq(0).text().replace(/\n|主演：/g, '')
        detail.status = $infos.eq(1).text().replace(/\n|状态：/g, '')
        detail.type = $infos.eq(2).text().replace(/\n|类型：/g, '')
        detail.area = $infos.eq(3).text().replace(/\n|地区：/g, '')
        detail.language = $infos.eq(4).text().replace(/\n|语言：/g, '')
        detail.director = $infos.eq(5).text().replace(/\n|导演：/g, '')
        detail.updateTime = $infos.eq(6).text().replace(/\n|时间/g, '')
        detail.years = $infos.eq(7).text().replace(/\n|年份：/g, '')
        detail.plot = $infos.eq(8).text().replace(/\n|剧情：/g, '')
        const $playerList = $('#detail-list .play-list-box')
        let mgtvIndex = -1
        $playerList.each(function(){
            let playerSource = $(this).find('.caption h4 img').attr('alt')
            if (playerSource.indexOf('芒芒TV') > -1) {
                mgtvIndex = $(this).index()
                return
            }
        })
        if (mgtvIndex > -1) {
            const playerSource_DC = await content.findElement(By.id('detail-list'))
            let mgtvBox_DC = await playerSource_DC.findElements(By.className('play-list-box'))
            let mgtvLink_DC = await mgtvBox_DC[mgtvIndex].findElement(By.className('content')).findElement(By.className('play-list')).findElement(By.tagName('a'))
            await this.driver.sleep(500)
            await this.driver.executeScript('arguments[0].click()', mgtvLink_DC)
            await this.driver.sleep(3000)
            // const playHtml = await switchFrame(this.driver)
            // const playVideoIframe = await this.driver.findElement(By.id('playleft')).findElements(By.tagName('iframe'))
            await this.driver.switchTo().frame(1)
            await this.driver.sleep(10000)
            // console.log('日日日', await this.driver.findElement(By.tagName('body')).getAttribute('innerHTML'))
            await this.driver.wait(until.elementLocated(By.id('J_miPlayerWrapper')), 1000*60)
            console.log('日日日', await this.driver.findElement(By.id('J_miPlayerWrapper')).getText())
            // const playerBodyHtml = await this.driver.findElement(By.tagName('body')).getAttribute('innerHTML')
            // const $playerBody = cheerio.load(playerBodyHtml)
            // /* const $playVideoFrame = cheerio.load(playVideoHTML)
            // console.log('日日日', $('#playleft iframe').eq(1).contents().html()) */
            // console.log('日日日', playerBodyHtml)
        }
        return []
    }
    getList(innerHTML) {
        const $ = cheerio.load(innerHTML)
        let list = []
        $('li').each(function() {
            const $playTxt = $(this).find('.play-txt')
            list.push({
                title: $playTxt.find('h5').text().replace(/\n/g, ''), // 标题
                starring: $playTxt.find('.actor').text().replace(/\n|主演：/g, ''), // 主演
                type: $playTxt.find('.type').eq(0).text().replace(/\n|类型：/g, ''), // 类型
                updateTime: moment(`20${$playTxt.find('.type').eq(1).text().replace(/\n|更新时间∶/g, '')}`).format('YYYY-MM-DD HH:mm:ss'), // 更新事件
                summary: $playTxt.find('.plot').text().replace(/\n|剧情：/g, ''), // 简介
                url: HOST + $(this).find('.play-img').attr('href')
            })
        })
        return list
    }
}

module.exports = search