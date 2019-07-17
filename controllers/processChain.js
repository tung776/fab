const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
puppeteer.use(StealthPlugin());
const helper = require("../facebook/actions/helper").helper;
var processAction = require("./processAction");
const path = require("path");
var fs = require("fs-extra");
var isProduction = process.env.NODE_ENV === "production";

process.on("message", async data => {
  // mongoose = require("mongoose");
  // mongoose.connect("mongodb://localhost/facebook");

  // // var account = null;

  if (data.isCheckMemory) {
    process.send({
      memory: process.memoryUsage().heapUsed / 1024 / 1024
    });
  } else {
    var account = data.account;
    const chainAction = data.chainAction;
    process.send({
      message: `${account.name} đang thực hiện nhiệm vụ ${chainAction.name}`,
      handler: `chainAction`,
      data: {
        account: {
          _id: account._id,
          name: account.name,
          username: account.username,
          profile: account.profile,
          facebook: account.facebook,
          email: account.email
        },
        chainAction: {
          _id: chainAction._id,
          name: chainAction.name
        }
      }
    });
    await this.processChain(account, chainAction);
  }
});

exports.saveData = async (account, chainAction) => {
  await processAction.saveData(
    {
      model: "Account",
      querry: {
        _id: account._id
      }
    },
    account
  );
};

exports.processChain = async (account, chainAction) => {
  let browser;
  try {
    // const agentData = account.userAgents[0];
    // const page = await browser.newPage();

    // await helper.intializePage(page, agentData.agent);
    // await page.goto(url, {
    //   waitUntil: "networkidle0",
    //   timeout: 5000
    // });
    var p = path.resolve("public/screenShot");
    var dir = `${p}\\${account.username}`;
    await fs.ensureDir(dir);
    await fs.emptyDir(dir);

    const agentData = account.userAgents[0];
    browser = await helper.setUpBrowser(account);

    let pages = [];
    for (let i = 0; i < chainAction.actions.length; i++) {
      const action = chainAction.actions[i].action;
      let page = null;
      pages.forEach(async item => {
        if (item.name == chainAction.actions[i].pageForAction) {
          page = item.value;
        }
      });

      if (page == null) {
        page = await browser.newPage();
        await helper.intializePage(page, agentData.agent);
        await helper.setCookies(page, account.cookie);
        pages.push({
          name: chainAction.actions[i].pageForAction,
          value: page
        });
      }
      if (page._closed == true) {
        if (browser._connection._closed == true) {
          browser = await helper.setUpBrowser(account);
        }
        page = await browser.newPage();
        await helper.intializePage(page, agentData.agent);
        await helper.setCookies(page, account.cookie);
      }
      await processAction.runAction(account, action, page);
    }
    if (browser._connection._closed != true) {
      pages = browser.pages;
      if (pages.length > 0) {
        pages.forEach(async item => await item.close());
      }
      browser.close();
    }

    process.send({
      message: `${account.username} đã thực hiện xong chuỗi hành động ${
        chainAction.name
      } `,
      next: true,
      accountId: `${account._id}`,
      account: account,
      status: true
    });
  } catch (error) {
    process.send({
      message: `${account.username} thực hiện thất bại ${
        chainAction.name
      }. Chi Tiết lỗi: ${error.message}`,
      status: false,
      next: true,
      error,
      accountId: account.id,
      account: account
    });
    const pages = browser.pages;
    if (pages.length > 0) {
      pages.forEach(async item => await item.close());
    }
    browser.close();
  }
  process.exit();
};
