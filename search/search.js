const { switchFrame, sendSearch, HOST } = require('../common/common');
const { By } = require('selenium-webdriver');
const cheerio = require('cheerio');
const moment = require('moment');

class search {
    constructor(driver) {
        this.driver = driver
    }
    async search(keyWords) {
        await this.driver.sleep(1000)
        let mainBody = await switchFrame(this.driver)
        this.driver.sleep(1000)
        // 发送搜索
        await sendSearch(mainBody, '捉妖记2') 
        this.driver.sleep(2000)
        mainBody = await switchFrame(this.driver)
        let searchList = await mainBody.findElement(By.id('contents')).getAttribute("innerHTML")
        return this.getList(searchList)
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