const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
puppeteer.use(StealthPlugin());
const helper = require("../facebook/actions/helper").helper;
var processAction = require("./processAction");
const path = require("path");
var fs = require("fs-extra");
var isProduction = process.env.NODE_ENV === "production";
var account = null;
let browser;
let currentAction;
let currentPage;

process.on("message", async data => {
  // mongoose = require("mongoose");
  // mongoose.connect("mongodb://localhost/facebook");

  // // var account = null;

  if (data.isLivetream) {
    var comment = data.comment;
    if (currentPage) {
      if (currentPage._closed == false) {
        var page = currentPage;
        var url = await page.url();
        if (
          !url.includes("videos") ||
          !url.includes("https://www.facebook.com")
        ) {
          return;
        }

        //comment

        await helper.hideChatWindow(page);
        console.log("begin comment...");
        var inputCommentSelector = "div.UFIAddCommentInput";

        var inputComment = await page.$(inputCommentSelector);
        if (inputComment) {
          try {
            await inputComment.click();
          } catch (error) {}
          await page.waitFor(1000);
          inputComment = await page.$(
            'div[contenteditable="true"][data-testid="ufi_comment_composer"]'
          );
          // inputComment = await page.$(
          //   'div.UFIAddCommentInput input[name="add_comment_text"]'
          // );

          try {
            if (inputComment && inputComment != null) {
              random = helper.randomMin2Max(800, 1200);
              await page.waitFor(random);
              console.log("typing ....");
              await inputComment.type(` ${comment}`, {
                delay: 110
              });
              await page.waitFor(800);
              await page.keyboard.press("Enter", {
                delay: 100
              });
              await page.waitFor(300);
              await page.keyboard.press("Enter", {
                delay: 100
              });
            } else {
              console.log("inputComment = null");
            }
          } catch (error) {
            console.log("đã có lỗi");
            console.log("Chi Tiết", error);
          }
        }

        //end comment
      }
    }
  } else if (data.isCheckMemory) {
    process.send({
      memory: process.memoryUsage().heapUsed / 1024 / 1024
    });
  } else {
    account = data.account;
    const chainAction = data.chainAction;
    let bag = data.bag;
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
    await this.processChain(account, chainAction, bag);
  }
});

exports.saveData = async (account, chainAction, bag) => {
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

exports.processChain = async (account, chainAction, bag) => {
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
      currentAction = action;
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
      currentPage = page;
      await processAction.runAction(account, action, page, bag);
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
