const { By, Key } = require('selenium-webdriver');
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
exports.HOST = 'http://aaqqy.com'
exports.switchFrame = switchFrame
exports.sendSearch = sendSearch