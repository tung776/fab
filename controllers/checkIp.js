const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
puppeteer.use(StealthPlugin());
const helper = require("../facebook/actions/helper").helper;
const ProxyChain = require("proxy-chain");
var account = null;

process.on("message", async data => {
  if (data.isCheckMemory) {
    process.send({
      memory: process.memoryUsage().heapUsed / 1024 / 1024
    });
  } else {
    var account = data.account;
    const url = data.url;
    await this.checkIp(account, url);
  }
});

exports.checkIp = async (account, url) => {
  let browser,
    page = null;
  try {
    const proxyData = account.proxies[0];
    const strProxy = `http://${proxyData.user}:${proxyData.pass}@${
      proxyData.ip
    }:${proxyData.port}`;
    const proxy = await ProxyChain.anonymizeProxy(strProxy);

    const agentData = account.userAgents[0];

    browser = await puppeteer.launch({
      // headless: false,
      args: [
        "--disable-notifications",
        "--disable-infobars",
        "--ignore-certifcate-errors",
        "--ignore-certifcate-errors-spki-list",
        `--proxy-server=${proxy}`,
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-accelerated-2d-canvas",
        "--disable-gpu",
        "--hide-scrollbars",
        "--window-size=1920x1080"
      ]
    });

    const pages = await browser.pages();
    page = pages[0];
    await helper.intializePage(page, agentData.agent);
    await page.goto(url, {
      waitUntil: "networkidle0",
      timeout: 5000
    });

    process.send({
      message: `${account.username} có địa chỉ IP ${
        account.proxies[0].ip
      } Đã kiểm tra thành công`,
      next: true,
      accountId: `${account._id}`,
      status: true
    });
  } catch (error) {
    process.send({
      message: `${account.username} có địa chỉ IP ${
        account.proxies[0].ip
      } gặp lỗi: ${error.message}`,
      status: false,
      next: true,
      error,
      accountId: account.id
    });
  }
  await page.close();
  browser.close();
  process.exit();
};
