const request = require("request");
const url = "https://www.pexels.com/search/girl/";
const fs = require("fs");
const imageSelector = "a.js-photo-link.photo-item__link > img";
const utils = require("../utils");
const cheerio = require("cheerio");
const human = require("./humanAction");
const appPath = require("../../appPath").originPath;
const axios = require("axios");
const helper = require("../actions/helper").helper;

const getPics = async (page, userList) => {
  await page.goto(url);
  let delay = human.normalDelayTime();
  // if (helper.haveCapha) {
  //   return {
  //     isError: true,
  //     userList: userList
  //   };
  // }
  await page.waitFor(delay);
  const itemTargetCount = userList.length;
  let pictures = [];

  try {
    // debugger;
    let previousHeight;
    while (pictures.length < itemTargetCount) {
      pictures = extractItems(await page.content(), imageSelector);
      previousHeight = await page.evaluate("document.body.scrollHeight");
      await page.evaluate("window.scrollTo(0, document.body.scrollHeight)");
      await page.waitForFunction(
        `document.body.scrollHeight > ${previousHeight}`
      );
      delay = human.normalDelayTime();
      await page.waitFor(delay);
    }
  } catch (e) {
    page.screenshot({
      path: `${appPath}/reports/getPics-${Date.now}.png`,
      type: "png",
      fullPage: true
    });
    return {
      isError: true,
      userList: userList
    };
  }

  for (let index = 0; index < pictures.length; index++) {
    if (index < userList.length) {
      const item = pictures[index];
      const strUrl = item;
      const filename = `profile-${userList[index].username}.jpg`;
      const filePath = `${appPath}/public/accounts/pictures/${filename}`;
      await utils.download(strUrl, filePath);
      userList[index].profile = filename;
    }
  }
  // debugger;
  return {
    isError: false,
    userList: userList
  };
};

function extractItems(content, selector) {
  var $ = cheerio.load(content);
  const items = [];
  $(selector).each(function() {
    items.push($(this).attr("src"));
  });

  return items;
}
const getUIface = async (
  page,
  userList,
  { count, gender, to_age, from_age, random }
) => {
  try {
    debugger;
    await page.goto("https://uifaces.co/api-docs");
    await page.waitForSelector("#try-form > form > button");
    await page.evaluate(
      `document.querySelector("#try-form > form > input[type=text]").value=""`
    );
    await human.type(
      page,
      "#try-form > form > input[type=text]",
      `?limit=${count}&gender[]=${gender}&from_age=${from_age}&to_age=${to_age}&random=${random}&emotion[]=happiness`
    );
    await page.click("#try-form > form > button");
    await page.waitForNavigation();
    await page.waitForSelector(".api-result");
    var $ = cheerio.load(page.content());
    var content = $(".api-result").innerText;
    debugger;
    const result = JSON.parse(content);

    for (let i = 0; i < userList.length; i++) {
      let user = userList[i];
      let url = result[i].photo;
      const filename = `profile-${userList[index].username}.jpg`;
      const filePath = `${appPath}/public/accounts/pictures/${filename}`;
      await utils.download(url, filePath);
      userList[index].profile = filename;
      userList[index].position = position;
    }
    // debugger;
  } catch (error) {}
  return userList;
};
module.exports.getPics = getPics;
module.exports.getUIface = getUIface;
