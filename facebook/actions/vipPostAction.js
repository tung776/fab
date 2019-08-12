const path = require("path");
const cheerio = require("cheerio");
const fs = require("fs");
var mongoose = require("mongoose");
const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
puppeteer.use(StealthPlugin());
const ProxyChain = require("proxy-chain");
const helper = {};
const dotenv = require("dotenv");
dotenv.config();
require("../../models/Proxy");
require("../../models/Cookie");
require("../../models/UserAgent");
require("../../models/Account");
require("../../models/Action");
require("../../models/ChainAction");
require("../../models/Status");
require("../../models/Task");
require("../../models/Vip");
var accountModel = mongoose.model("Account");
module.exports = async function(bag) {
  var page = bag.page;
  var helper = bag.helper;
  var url = "";
  console.log("đang lấy dữ liệu VIP");
  var vipModel = bag.mongoose.model("Vip");
  var vips = await vipModel.find();
  console.log("vips.length", vips.length);
  for (var i = 0; i < vips.length; i++) {
    for (var j = 0; j < vips[i].posts.length; j++) {
      url = vips[i].posts[j];
      console.log(
        "====================================================================="
      );
      console.log("url: ", url);
      try {
        await page.goto(url, {
          timeout: 20000
        });
      } catch (err) {
        throw new Error(err);
      }
      var random = helper.randomMin2Max(1200, 2000);
      await page.waitFor(random);

      for (var c = 0; c < 8; c++) {
        await page.evaluate(() => {
          window.scrollBy(0, window.innerHeight);
        });
        await page.waitFor(500);
      }

      //like
      try {
        var likeSelector =
          'div[data-testid="UFI2ReactionLink/actionLink"] a[data-testid="UFI2ReactionLink"][aria-pressed="false"]';

        try {
          await page.waitForSelector(likeSelector, {
            timeout: 15000,
            visible: true
          });
        } catch (error) {}
        await page.waitFor(500);

        var linkLikes = await page.$(likeSelector);
        if (linkLikes != undefined) {
          console.log("linkLikes: ", linkLikes.length);
          console.log("focus()...");
          await linkLikes.focus();
          random = helper.randomMin2Max(400, 500);
          await page.waitFor(random);
          console.log("click()...");
          await linkLikes.click();
          random = helper.randomMin2Max(450, 550);
          await page.waitFor(random);
        }
      } catch (error) {
        throw new Error(error);
      }

      // comments
      console.log("begin comment...");
      var inputCommentSelector =
        'div[data-testid="UFI2Composer/root"] form div[contenteditable="true"]';
      try {
        await page.waitForSelector(inputCommentSelector, {
          timeout: 15000,
          visible: true
        });
      } catch (error) {}

      var inputComment = await page.$(inputCommentSelector);
      if (inputComment) {
        await inputComment.focus();
        await page.waitFor(1000);
        inputComment = await page.$(inputCommentSelector);

        var content = await page.content();
        var $ = bag.cheerio.load(content);
        var comments = $('div[data-testid="UFI2Comment/body"] > div >span');
        var personComment = helper.randomFromArray(comments);
        personComment = $(personComment).text();
        var randomComment = helper.randomCommentsLike();
        console.log("randomComment: ...", randomComment);
        console.log("personComment: ...", personComment);
        var shouldSelectrandom = Math.random() >= 0.3;
        var comment = "";
        if (personComment != "") {
          if (shouldSelectrandom) {
            comment = randomComment;
          } else {
            comment = personComment;
          }
        } else {
          comment = randomComment;
        }
        console.log("comment: ...", comment);
        console.log("inputComment.focus()");
        await page.focus(inputCommentSelector);
        random = helper.randomMin2Max(450, 550);
        await page.waitFor(random);
        console.log("typing ....");
        await page.type(inputCommentSelector, comment, {
          delay: 110
        });
        await page.waitFor(800);
        await page.keyboard.press("Enter", {
          delay: 100
        });
      }

      //share
      var shareSelector = "form.commentable_item a._2nj7";
      console.log("bắt đầu chia sẻ");
      var linkShares = await page.$$(shareSelector);
      if (linkShares[0] != undefined) {
        await page.evaluate(index => {
          var shares = document.querySelectorAll(
            "form.commentable_item a._2nj7"
          );
          if (shares[index] != undefined) {
            shares[index].scrollIntoViewIfNeeded();
          }
        }, 0);
        random = helper.randomMin2Max(400, 500);
        try {
          await page.waitForSelector(shareSelector, {
            timeout: 15000,
            visible: true
          });
        } catch (error) {}
        linkShares = await page.$$(shareSelector);
        console.log("linkShares.length = ", linkShares.length);

        await page.waitFor(random);
        await linkShares[0].click();
        console.log("bắt đầu click share");
        try {
          await page.waitForSelector('a[ajaxify*="/share/dialog/submit/?', {
            timeout: 15000,
            visible: true
          });
        } catch (error) {}
        await page.waitFor(1000);
        var btns = await page.$$('a[ajaxify*="/share/dialog/submit/?');
        console.log("btns.length = ", btns.length);
        const result = await helper.elementClick(btns[0], page);
        if (result) {
          random = helper.randomMin2Max(10000, 12000);
          await page.waitFor(random);
        }
      }
      random = helper.randomMin2Max(800, 1200);
      await page.waitFor(random);
    }
  }
};
