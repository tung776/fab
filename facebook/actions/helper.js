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

helper.randomMin2Max = function(min, max) {
  var rand = Math.random() * (max - min) + min;
  return rand;
};
helper.lastName = function() {
  var lastNames = [
    "Nguyen",
    "Nguyen",
    "Thao",
    "Thanh",
    "Phuong",
    "Tran",
    "Tam",
    "Nhat",
    "Le",
    "Nhan",
    "Hoang",
    "Huynh",
    "Phan",
    "Phan",
    "Dang",
    "Bui",
    "Do",
    "Ho",
    "Ngo",
    "Duong",
    "Bao",
    "Bao",
    "Bich",
    "Bao",
    "Ai",
    "Thuy",
    "Ai",
    "Ly",
    "Thien",
    "Thuc",
    "Thu",
    "Thi",
    "Vo"
  ];
  return helper.randomFromArray(lastNames);
};
helper.firstName = function() {
  var firstNames = [
    "Hong",
    "Khanh",
    "Linh",
    "Nhan",
    "Nhi",
    "Thi",
    "Thy",
    "Ha",
    "Hang",
    "Nhan",
    "Nhien",
    "Chi",
    "Dao",
    "Hoa",
    "Hong",
    "Huong",
    "Le",
    "Linh",
    "Mai",
    "Ngoc",
    "Thi",
    "Thao",
    "Tho",
    "Thu",
    "Trang",
    "Tuyet",
    "Xuan",
    "Cuc",
    "Quynh",
    "Lien",
    "Loan",
    "Bang",
    "Tam",
    "Anh",
    "Chau",
    "Ha",
    "Han",
    "Hue",
    "Quyen",
    "Tram",
    "Tran",
    "Truc",
    "Uyen",
    "Nga",
    "Nhu",
    "Tuyen",
    "Tho",
    "Duyen",
    "Thao"
  ];
  return helper.randomFromArray(firstNames);
};
helper.birthday = function() {
  day = Math.floor(helper.randomMin2Max(1, 28));
  month = Math.floor(helper.randomMin2Max(1, 12));
  year = Math.floor(helper.randomMin2Max(1992, 2002));
  return {
    day,
    month,
    year
  };
};
helper.hideChatWindow = async function(page) {
  var hideToggler = await page.$$("#fbDockChatBuddylistNub .hideToggler");
  if (hideToggler.length > 0) {
    await page.waitFor(500);
    await page.click("#fbDockChatBuddylistNub .fbNubButton");
    await page.waitFor(400);
  }
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
  let browser = null;
  try {
    browser = await puppeteer.launch({
      headless: process.env.headless == "false" ? false : true,
      args: browserArgs,
      ignoreDefaultArgs: ["--disable-extensions"],
      executablePath: process.env.executablePath
    });
  } catch (error) {
    console.log("=========== Da co loi ==================");
    console.log(error);
  }
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
      } catch (error) {
        console.log("da co loi", error);
      }
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
  try {
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
  } catch (error) {
    console.log(error);
    return false;
  }
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

helper.uploadProfile = async (page, pictureProfilePath) => {
  try {
    let content = await page.content();
    const $ = cheerio.load(content);
    await page.evaluate(() => {
      window.scroll(0, 0);
    });
    try {
      await page.waitForSelector(
        "div.fbTimelineProfilePicSelector.fbTimelineNullProfilePicSelector a",
        {
          timeout: 5000,
          visible: true
        }
      );
    } catch (error) {}
    const image = page.$(
      "div.fbTimelineProfilePicSelector.fbTimelineNullProfilePicSelector a"
    );
    if (!image) {
      console.log("đã có ảnh đại diện");
      return true;
    }
    await page.focus(
      "div.fbTimelineProfilePicSelector.fbTimelineNullProfilePicSelector a"
    );
    await page.waitFor(1200);
    await page.click(
      "div.fbTimelineProfilePicSelector.fbTimelineNullProfilePicSelector a"
    );
    try {
      await page.waitForSelector('div.uiLayer div[role="dialog"]', {
        timeout: 10000,
        visible: true
      });
      await page.waitFor(1000);
      console.log("chuẩn bị tải ảnh");
      const result = await helper.uploadFile(
        page,
        'div.uiLayer div[role="dialog"] input[type="file"]',
        pictureProfilePath
      );
      if (result) {
        try {
          try {
            await page.waitFor(
              'div[data-testid="profile_pic_crop_dialog"] div[behavior="free"]',
              { visible: true }
            );
          } catch (error) {}
          await page.waitFor(1000);
          console.log("đang điều chỉnh slide ảnh");
          await page.waitFor(1000 * 60 * 1);
          try {
            await page.waitFor(".uiOverlayFooter .rfloat a", {
              timeout: 5000,
              visible: true
            });
          } catch (error) {}
          await page.click(".uiOverlayFooter .rfloat a");

          try {
            await page.focus('button[data-testid="profilePicSaveButton"]');
            await page.click('button[data-testid="profilePicSaveButton"]');
            try {
              await page.waitForNavigation({ timeout: 10000 });
            } catch (error) {}
            await page.waitFor(1000);
          } catch (error) {}
        } catch (error) {}
      }
      return result;
    } catch (error) {}
  } catch (error) {
    console.log("đã có lỗi: ", error);
    return false;
  }
};
helper.testUploadImage = async (page, filePath) => {
  const btnTakePicture = 'div[aria-label="Search by image"]';
  try {
    await page.waitFor(btnTakePicture, { timeout: 5000, visible: true });
  } catch (error) {}
  await page.click(btnTakePicture);
  try {
    await page.waitFor("#qbp", { timeout: 5000, visible: true });
    await page.waitFor(500);
    await page.click("#qbp .qbwr a");
  } catch (error) {}
  try {
    await page.waitFor("#qbp #qbfile", { timeout: 5000, visible: true });
    console.log("sẵn sàng tải file", filePath);
    await helper.uploadFile(page, "#qbp #qbfile", filePath);
    console.log("thực hiện xong");
  } catch (error) {}
};
helper.uploadFile = async (page, selector, filePath) => {
  try {
    try {
      console.log("selector: ", selector);
      console.log("đang tải file: ", filePath);
      try {
        await page.waitFor(selector, { timeout: 20000, visible: true });
      } catch (error) {
        console.log(" không tìm thấy ", selector);
      }

      const input = await page.$(selector);

      try {
        await input.uploadFile(filePath);
      } catch (error) {
        console.log("đã có lỗi", error);
      }

      return true;
    } catch (error) {
      console.log("Đã có lỗi ", error);
      console.log("không tìm thấy: ", selector);
      return false;
    }
  } catch (error) {
    console.log("upload file thất bại: ", error);
    return false;
  }
};

helper.activeFacebook = async (page, account) => {
  console.log("đang lấy email kích hoạt");
  const proxyData = account.proxies[0];

  const emails = await helper.getMails({
    page,
    query: "registration@facebookmail.com"
  });
  console.log("emails ", emails.length);
  let url = "";
  emails.forEach(mail => {
    const $ = cheerio.load(mail.text);
    const items = $(
      'a[href*="https://www.facebook.com/n/?confirmemail.php"][data-auth="NotApplicable"]'
    );

    if (items.length > 0) {
      url = $(items[0]).attr("href");
    }
  });
  console.log("============================================");
  console.log(url);
  await page.goto(url);
  try {
    await page.waitFor(500);
    await page.click('div[data-click="profile_icon"] '); //vào trang chủ tài khoản
    try {
      await page.waitForNavigation();
    } catch (error) {}
    account.facebook = await page.url();
    let accountData = await accountModel.findById(account._id);
    accountData.facebook = account.facebook;
    console.log("facebook = ", account.facebook);
    await accountData.save();
  } catch (error) {
    console.log("da co loi", error);
  }
  try {
    await page.waitForSelector('.uiOverlayFooterButtons a[role="button"]', {
      visible: true,
      timeout: 15000
    });
  } catch (error) {}
  await page.waitFor(500);
  console.log("hủy thay đổi hình nền");
  await page.click('.uiOverlayFooterButtons a[role="button"]'); //hủy thay đổi hình nền
  try {
    await page.waitForSelector(".uiOverlayFooter button.layerConfirm", {
      timeout: 15000
    });
  } catch (error) {}
  await page.waitFor(500);
  console.log("chấp nhận thay đổi thông tin cơ bản");
  await page.click(".uiOverlayFooter button.layerConfirm"); //chấp nhận thay đổi thông tin cơ bản
  var home = helper.getHomeCountry(proxyData.location);
  console.log("Nơi ở ", proxyData.location);
  await page.waitFor(2000);
  await helper.typeBasicInfor(page, home); //Nơi ở
  console.log("Quê quán ", proxyData.location);
  await page.waitFor(2000);
  await helper.typeBasicInfor(page, home); //quê quán
  var school = helper.getSchool(proxyData.location);
  await page.waitFor(1500);
  await helper.typeBasicInfor(page, school);
  var University = helper.getUniversity(proxyData.location);
  await page.waitFor(1500);
  await helper.typeBasicInfor(page, University);
  var company = helper.getCompany(proxyData.location);
  console.log("đang điền thông tin công ty ", company);
  await page.waitFor(1500);
  await helper.typeBasicInfor(page, company);
  try {
    try {
      await page.waitForSelector("div.uiOverlayFooter button.layerConfirm", {
        timeout: 15000
      });
    } catch (error) {}
    await page.waitFor(1000);
    await page.click("div.uiOverlayFooter button.layerConfirm");
  } catch (error) {
    console.log("da co loi", error);
  }

  try {
    try {
      await page.waitForSelector('button[value="deny"]');
    } catch (error) {}
    await page.waitFor(500);
    await page.click('button[value="deny"]');
  } catch (error) {
    console.log("da co loi", error);
  }
  try {
    try {
      await page.waitForSelector('#timeline_info_review_unit a[role="button"]');
    } catch (error) {}
    await page.waitFor(500);
    const btns = await page.$$('#timeline_info_review_unit a[role="button"]');
    await btns[btns.length - 1].click();
  } catch (error) {
    console.log("da co loi", error);
  }
  // await page.waitFor(1000 * 60 * 5); // chờ 5 phút để thao tác thủ công
};
helper.typeBasicInfor = async (page, text) => {
  await page.type('input[data-testid="searchable-text-input"]', text, {
    delay: 100
  });
  await page.waitFor(2500);
  await page.keyboard.press("ArrowDown", { delay: 100 });
  await page.waitFor(1200);
  await page.keyboard.press("Enter", { delay: 100 });
  await page.waitFor(800);
  try {
    await page.focus('button[value="confirm"]');
  } catch (error) {}
  await page.click('button[value="confirm"]', { delay: 100 });
  await page.waitFor(1800);
};
helper.getSchool = location => {
  if (location.trim() == "cali") {
    return helper.randomFromArray(["Chicago Academy High School"]);
  }
  if (location.trim() == "hcm") {
    return helper.randomFromArray(["Trường THPT Thành Nhân - Tp.Hồ Chí Minh"]);
  }
  if (location.trim() == "danang") {
    return helper.randomFromArray(["THPT Quang Trung - Đà Nẵng"]);
  }
  if (location.trim() == "hanoi") {
    return helper.randomFromArray(["THPT chuyên Hà Nội - Amsterdam"]);
  }
  if (location.trim() == "sg") {
    return helper.randomFromArray(["school singapore"]);
  }
  if (location.trim() == "us") {
    return helper.randomFromArray(["Chicago Academy High School"]);
  }
  if (location.trim() == "hatinh") {
    return helper.randomFromArray(["Hà tĩnh, Việt Nam"]);
  }
  if (location.trim() == "dongnai") {
    return helper.randomFromArray(["Đồng nai, Việt Nam"]);
  }
  if (location.trim() == "quangnam") {
    return helper.randomFromArray(["Quảng Nam, Việt Nam"]);
  } else {
    return helper.randomFromArray(["Chicago Academy High School"]);
  }
};
helper.getUniversity = location => {
  if (location.trim() == "cali") {
    return helper.randomFromArray(["Oxford College of Emory University"]);
  }
  if (location.trim() == "hcm") {
    return helper.randomFromArray(["Đại Học Bách Khoa Hồ Chí Minh"]);
  }
  if (location.trim() == "danang") {
    return helper.randomFromArray(["Đại Học Bách Khoa Hồ Chí Minh"]);
  }
  if (location.trim() == "hanoi") {
    return helper.randomFromArray(["Trường Đại học Bách Khoa Hà Nội"]);
  }
  if (location.trim() == "sg") {
    return helper.randomFromArray(["Singapore Management University"]);
  }
  if (location.trim() == "us") {
    return helper.randomFromArray(["Oxford College of Emory University"]);
  }
  if (location.trim() == "hatinh") {
    return helper.randomFromArray(["Trường Đại học Bách Khoa Hà Nội"]);
  }
  if (location.trim() == "dongnai") {
    return helper.randomFromArray(["Trường Đại học Bách Khoa Hà Nội"]);
  }
  if (location.trim() == "quangnam") {
    return helper.randomFromArray(["Trường Đại học Bách Khoa Hà Nội"]);
  } else {
    return helper.randomFromArray(["Oxford College of Emory University"]);
  }
};
helper.getCompany = location => {
  const vietnamCompanies = [
    "Thế giới di động",
    "ngân hàng nông nghiệp",
    "vnpt",
    "mobiphone",
    "petrolimex",
    "FPT",
    "viettel",
    "vnpt",
    "FPT",
    "Điện máy xanh"
  ];
  if (location.trim() == "cali") {
    return helper.randomFromArray(["BYK", "petrolimex"]);
  }
  if (location.trim() == "hcm") {
    return helper.randomFromArray(vietnamCompanies);
  }
  if (location.trim() == "danang") {
    return helper.randomFromArray(vietnamCompanies);
  }
  if (location.trim() == "hanoi") {
    return helper.randomFromArray(vietnamCompanies);
  }
  if (location.trim() == "sg") {
    return helper.randomFromArray(["petrolimex"]);
  }
  if (location.trim() == "us") {
    return helper.randomFromArray(["petrolimex", "BYK", "chemicals"]);
  }
  if (location.trim() == "hatinh") {
    return helper.randomFromArray(vietnamCompanies);
  }
  if (location.trim() == "dongnai") {
    return helper.randomFromArray(vietnamCompanies);
  }
  if (location.trim() == "quangnam") {
    return helper.randomFromArray(vietnamCompanies);
  } else {
    return helper.randomFromArray(["petrolimex", "BYK", "chemicals"]);
  }
};
helper.getHomeCountry = location => {
  if (location.trim() == "cali") {
    return helper.randomFromArray(["Chicago, Illinois"]);
  }
  if (location.trim() == "hcm") {
    return helper.randomFromArray(["Ho Chi Minh City, Vietnam"]);
  }
  if (location.trim() == "danang") {
    return helper.randomFromArray(["Da Nang, Vietnam"]);
  }
  if (location.trim() == "hanoi") {
    return helper.randomFromArray(["Hanoi, Vietnam"]);
  }
  if (location.trim() == "hanoi") {
    return helper.randomFromArray(["Hanoi, Vietnam"]);
  }
  if (location.trim() == "sg") {
    return helper.randomFromArray(["singapore"]);
  }
  if (location.trim() == "hatinh") {
    return helper.randomFromArray(["Hà tĩnh, Việt Nam"]);
  }
  if (location.trim() == "dongnai") {
    return helper.randomFromArray(["Đồng nai, Việt Nam"]);
  }
  if (location.trim() == "quangnam") {
    return helper.randomFromArray(["Quảng Nam, Việt Nam"]);
  }
  if (location.trim() == "us") {
    return helper.randomFromArray(["Chicago, Illinois"]);
  } else {
    return helper.randomFromArray(["Chicago, Illinois"]);
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
  } catch (error) {
    console.log("da co loi", error);
  }
};
helper.joinGroup = require("./jointGroup");
const outlook = require("../../common/outlook");
helper.getMails = outlook.getMails;
helper.getMail = outlook.getMail;
helper.signin = outlook.signin;
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
