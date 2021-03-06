const { By, until } = require('selenium-webdriver');
const moment = require('moment');

const getDetail = async(driver, content, title) => {
    let detail = {}
    // 隐藏广告
    const ad = await content.findElement(By.tagName('a'))
    await driver.executeScript('arguments[0].setAttribute("style", "display:none")', ad)
    await driver.wait(until.titleMatches(new RegExp(title), 3000))
    const movieBody = await content.findElement(By.id('resize_vod'))
    const infoBody = await movieBody.findElement(By.className('vod-n-l'))
    const currentUrl = await driver.getCurrentUrl()
    detail.aayyqId = currentUrl.substring(currentUrl.lastIndexOf('-') + 1, currentUrl.lastIndexOf('.'))
    detail.title = (await infoBody.findElement(By.tagName('h1')).getText()).replace(/\n|/g, '').trim()
    const infos = await infoBody.findElements(By.tagName('p'))
    detail.status = (await infos[0].getText()).replace(/\n|状态：/g, '')
    detail.starring = (await infos[1].getText()).replace(/\n|主演：/g, '')
    detail.type = (await infos[2].getText()).replace(/\n|类型：/g, '')
    detail.director = (await infos[3].getText()).replace(/\n|导演：/g, '')
    detail.area = (await infos[4].getText()).replace(/\n|地区：/g, '')
    detail.updateTime = (await infos[5].getText()).replace(/\n|更新：/g, '')
    detail.updateTime = moment(`20${detail.updateTime}`).format('YYYY-MM-DD HH:mm:ss')
    detail.imageUrl = await movieBody.findElement(By.className('vod-l')).findElement(By.tagName('img')).getAttribute('data-original')
    const playTabs = await content.findElement(By.className('vod-play-tab')).findElements(By.tagName('li'))
    await playTabs[1].findElement(By.tagName('span')).click()
    await driver.wait(until.elementIsVisible(content.findElement(By.id('con_vod_2'))), 3000)
    const plot = await content.findElement(By.id('con_vod_2')).getText()
    detail.plot = plot.replace(/\n|/g, '')
    await movieBody.findElement(By.className('vod_play')).findElement(By.tagName('a')).click()
    await driver.sleep(1000)
    const iframes = await driver.findElements(By.tagName('iframe'))
    const iframeSrc = await iframes[1].getAttribute('src')
    await driver.switchTo().frame(1)
    await driver.sleep(1000)
    if (iframeSrc.indexOf('mgtv') > -1) {
        await driver.wait(until.elementLocated(By.id('J_miPlayerWrapper')), 5000)
        detail.playerUrl = await driver.findElement(By.id('J_miPlayerWrapper')).findElement(By.tagName('video')).getAttribute('src')
    }/*  else {
        await driver.wait(async() => {
            const video = await driver.findElement(By.tagName('video'))
            return await driver.executeScript('return arguments[0].duration', video) 
        }, 1000*60)
        detail.playerUrl = iframeSrc.replace(/height=[\d]+/, 'height=490')
    } */
    return detail
}
module.exports = getDetail