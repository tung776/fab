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

helper.randomMin2Max = function(min, max) {
  var rand = Math.random() * (max - min) + min;
  return rand;
};
helper.randomFromArray = function(array) {
  var item = array[Math.floor(Math.random() * array.length)];
  return item;
};
helper.randomCommentsLike = function() {
  let comments = [
    "Hay quá",
    "like",
    "hi",
    "hì hì",
    "cố lên",
    "goodluck",
    ".",
    "!",
    "bravo",
    "zui ghê",
    "ẹc",
    "up",
    "lên nào"
  ];
  var item = helper.randomFromArray(comments);
  return item;
};

helper.setUpBrowser = async account => {
  const proxyData = account.proxies[0];
  const strProxy = `http://${proxyData.user}:${proxyData.pass}@${
    proxyData.ip
  }:${proxyData.port}`;
  const proxy = await ProxyChain.anonymizeProxy(strProxy);
  let browserArgs = [
    "--lang=vi-VN,vi",
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
    // "--hide-scrollbars",
    "--window-size=1920x1080"
  ];
  const browser = await puppeteer.launch({
    headless: process.env.headless == "false" ? false : true,
    // args: browserArgs,
    ignoreDefaultArgs: ["--disable-extensions"],
    executablePath: process.env.executablePath
  });
  // const chromeArguments = browser.
  // console.log(chromeArguments);
  return browser;
};

helper.findElements = async (page, selector) => {
  const content = await page.content();
  const $ = cheerio.load(content);
  const els = $(selector);
  // console.log();
  return els;
};
// helper.findElements = selector => {
//   const r = document.querySelectorAll(selector);
//   r[0].scrollIntoView();
//   return r.length;
// };
helper.findFirst = async (page, selector) => {
  return helper.findElements(page, selector)[0] || null;
};

helper.intializePage = async (page, userAgent) => {
  const blockedResourceTypes = [
    "image",
    "media",
    "font",
    "texttrack",
    "object",
    "beacon",
    "csp_report",
    "imageset"
  ];

  const skippedResources = [
    "quantserve",
    "adzerk",
    "doubleclick",
    "adition",
    "exelator",
    "sharethrough",
    "cdn.api.twitter",
    "google-analytics",
    "googletagmanager",
    // "google",
    "fontawesome",
    // "facebook",
    "analytics",
    "optimizely",
    "clicktale",
    "mixpanel",
    "zedo",
    "clicksor",
    "tiqcdn"
  ];

  // await page.setViewport({ width: 1080, height: 1920 });
  await page.setRequestInterception(true);
  await page.setUserAgent(userAgent);

  page.on("console", msg => {
    const leng = msg.args().length;
    for (let i = 0; i < leng; i += 1) {
      console.log(`${i}: ${msg.args()[i]}`);
    }
  });

  page.on("request", request => {
    const requestUrl = request._url.split("?")[0].split("#")[0];
    if (requestUrl.includes("checkpoint")) {
      try {
        let content = "";
        fs.writeFile(`${__dirname}/error.log`, content, function(err) {
          if (err) {
            return console.log(err);
          }

          console.log("The file was saved!");
        });
      } catch (error) {}
    }

    if (
      // blockedResourceTypes.indexOf(request.resourceType()) !== -1 ||
      skippedResources.some(resource => requestUrl.indexOf(resource) !== -1)
    ) {
      request.abort();
    } else {
      request.continue();
    }
  });

  // page.on("error", error => {
  //   debug(`Chrome Handler: GENERAL ERROR on: ${targetURL} : ${error}`);
  //   debug(
  //     `GLOBAL CHROMEPOOL count after releasing instance on ERROR: ${
  //       global.chromepool.borrowed
  //     } for: ${targetURL}`
  //   );
  //   if (error.code === "PPTR_TIMEOUT") {
  //     global.io.emit("errorMessage", {
  //       message: `Thời gian thực hiện quá lâu: ${error.message}`,
  //       stack: `${error.stack}`
  //     });
  //   } else {
  //     global.io.emit("errorMessage", {
  //       message: `${error.message}`,
  //       stack: `${error.stack}`
  //     });
  //   }
  //   global.chromepool.release(browser);
  // });
  /*There are a few things to notice here.Puppeteer has a waitUntil option, that allows you to define when a page 
  is finished loading.‘networkidle2’ means that there are no more than 2 active requests open.This is a good 
  setting because for some websites(e.g.websites using websockets) there will always be connections open  
  */
};

helper.elementClick = async (element, page) => {
  var isVisible = false;
  try {
    isVisible = await helper.isVisible(element, page);
  } catch (error) {
    isVisible = false;
  }
  console.log("isVisible = ", isVisible);
  if (isVisible) {
    try {
      await element.click();
      return true;
    } catch (error) {
      return false;
    }
  }
  return false;
};

helper.getCookies = async page => {
  const { cookies } = await page._client.send("Network.getAllCookies", {});

  return cookies;
};
helper.setCookies = async (page, cookies) => {
  const items = cookies
    .map(cookie => {
      const item = Object.assign({}, cookie);
      if (!item.value) item.value = "";
      console.assert(!item.url, `Cookies must have a URL defined`);
      console.assert(
        item.url !== "about:blank",
        `Blank page can not have cookie "${item.name}"`
      );
      console.assert(
        !String.prototype.startsWith.call(item.url || "", "data:"),
        `Data URL page can not have cookie "${item.name}"`
      );
      return item;
    })
    .filter(cookie => cookie.name);

  await page.deleteCookie(...items);

  if (items.length)
    await page._client.send("Network.setCookies", { cookies: items });
};

helper.haveCapha = async page => {
  const $ = cheerio.load(page.content());
  const content = $("body").innerText;
  if (content.includes("reCAPTCHA")) {
    return true;
  }
  return false;
};
helper.autoGenPass = () => {
  const pass = Math.random()
    .toString(36)
    .substr(2, 12);
  return pass;
};

helper.newPage = async (browser, account) => {
  const agentData = account.userAgents[0];
  const page = await browser.newPage();
  console.log("đang cài cookie, account.cookie = ", account.cookie.length);
  await helper.intializePage(page, agentData.agent);
  await helper.setCookies(page, account.cookie);

  try {
    await page.addScriptTag({
      path: path.join(__dirname, "../../common/scraper.js")
    });
  } catch (error) {
    console.log(error);
  }
  // page.on("pageerror", () => {
  //   const br = page.browser();
  //   page.close();
  //   br.close();
  // });
  // page.on("error", () => {
  //   const br = page.browser();
  //   page.close();
  //   br.close();
  // });
  // page.on("close", async () => {
  //   console.log("page closed");
  //   const cookies = await helper.getCookies(page);
  //   if (cookies && cookies.length > 0) {
  //     account.cookie = cookies;
  //     account.save();
  //   }
  // });
  return page;
};

helper.scroll = async (page, scrollDelay = 1000) => {
  let previousHeight;
  try {
    while (mutationsSinceLastScroll > 0 || initialScrolls > 0) {
      mutationsSinceLastScroll = 0;
      initialScrolls--;
      previousHeight = await page.evaluate("document.body.scrollHeight");
      await page.evaluate("window.scrollTo(0, document.body.scrollHeight)");
      await page
        .waitForFunction(`document.body.scrollHeight > ${previousHeight}`, {
          timeout: 600000
        })
        .catch(e => console.log("scroll failed"));
      await page.waitFor(scrollDelay);
    }
  } catch (e) {
    console.log(e);
  }
};

helper.isVisible = async (element, page) => {
  const isVisibleHandle = await page.evaluateHandle(e => {
    const style = window.getComputedStyle(e);
    return (
      style &&
      style.display !== "none" &&
      style.visibility !== "hidden" &&
      style.opacity !== "0"
    );
  }, element);
  var visible = await isVisibleHandle.jsonValue();
  const box = await element.boxModel();
  if (visible && box) {
    return true;
  }
  return false;
};

helper.saveOneData = async (querries, accountData) => {
  try {
    let model = await helper.loadDataViaModelName(
      querries.model,
      querries.querry
    );
    model = model[0];
    var props = Object.keys(accountData);
    props.forEach(prop => {
      if (prop != "__v") model[prop] = accountData[prop];
    });
    await model.save();
  } catch (error) {
    console.log("Đã có lỗi: ", error);
  }
};

helper.loadDataViaModelName = async (modelName, querry) => {
  try {
    var modelSchemas = mongoose.modelSchemas;
    var SchemaNames = Object.keys(modelSchemas);
    if (SchemaNames.indexOf(modelName) < 0) return null;
    const model = mongoose.model(modelName);
    data = await model.find(querry);
    return data;
  } catch (error) {}
};

module.exports.helper = helper;

// const helper = ((window, document) => {
//   const findItems = ({ selector, where = () => true, count }) => {
//     if (count === 0) {
//       return [];
//     }

//     const elements = Array.from(document.querySelectorAll(selector));
//     let sliceArgs = [0, count || elements.length];

//     if (count < 0) {
//       sliceArgs = [count];
//     }

//     return elements
//       .map(el => new Element(el))
//       .filter(where)
//       .slice(...sliceArgs);
//   };

//   const findOne = ({ selector, where }) =>
//     find({ selector, where, count: 1 })[0] || null;
// })(window, document);

// window.helper = helper;
