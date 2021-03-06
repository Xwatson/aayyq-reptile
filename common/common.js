const { By, Key, until } = require('selenium-webdriver');
/**
 * 切换frame
 */
const switchFrame = async (driver) => {
    await driver.sleep(500)
    await driver.switchTo().defaultContent()
    await driver.switchTo().frame(await driver.findElement(By.id('frameset')))
    await driver.switchTo().frame(0)
    return await driver.findElement(By.tagName('body'))
}
/**
 * 发送搜索事件
 */
const sendSearch = async (driver, keyWords) => {
    return await driver.findElement(By.id('wd')).sendKeys(keyWords, Key.RETURN)
}
/**
 * 发送搜索事件
 */
const sendSearchByMobile = async (driver, keyWords) => {
    await driver.findElement(By.className('aHeaderSearch')).click()
    await driver.wait(until.elementIsVisible(driver.findElement(By.className('searchPop'))), 3000)
    await driver.findElement(By.id('wd')).sendKeys(keyWords)
    return await driver.findElement(By.className('cancelInput2')).click()
}
exports.HOST = 'http://c.aaccy.com'
exports.switchFrame = switchFrame
exports.sendSearch = sendSearch
exports.sendSearchByMobile = sendSearchByMobile