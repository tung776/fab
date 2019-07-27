const { fork } = require("child_process");
var mongoose = require("mongoose");
var accountModel = mongoose.model("Account");
var userAgentModel = mongoose.model("UserAgent");
var proxyModel = mongoose.model("Proxy");
const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
puppeteer.use(StealthPlugin());
const helper = require("../facebook/actions/helper").helper;
const proxy = require("../facebook/data/ip");
const agent = require("../facebook/data/userAgent");
const status = require("../models/enum").Status;
const types = require("../models/enum").typeActions;
const waitEnum = require("../models/enum").waitEnum;
const userGen = require("../facebook/actions/user");
const originPath = require("../appPath").originPath;
const picture = require("../facebook/actions/getFemalePic");
const axios = require("axios");
const ProxyChain = require("proxy-chain");
const { Cluster } = require("puppeteer-cluster");
const human = require("../facebook/actions/humanAction");
var actionModel = mongoose.model("Action");

exports.index = async (req, res) => {
  try {
    let accounts = await accountModel.find();
    let userAgents = await userAgentModel.find();
    let proxies = await proxyModel.find();
    let actions = await actionModel.find();
    var statuses = Object.values(status);
    return res.render("accounts/index", {
      accounts,
      userAgents,
      proxies,
      status: statuses,
      actions: actions
    });
  } catch (error) {
    console.log(error);
  }
};
exports.auto = async (req, res) => {
  try {
    let accounts = [];
    const IP = await proxy.anonymizeProxy();
    const browser = await puppeteer.launch({
      headless: false,
      args: [
        "--disable-notifications",
        // `--proxy-server=${IP}`,
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-accelerated-2d-canvas",
        "--disable-gpu",
        "--window-size=1920x1080"
      ]
    });

    const page = await browser.newPage();
    await helper.intializePage(page, agent.getRandomAgents());
    // debugger;
    let fakeUsers = await userGen.fakeUsersToCSV(
      page,
      1,
      `${originPath}/public`
    );
    let userAgents = await userAgentModel.find();
    let proxies = await proxyModel.find();
    // debugger;
    const result = await picture.getPics(page, fakeUsers);
    // fakeUsers = await picture.getUIface(page, fakeUsers, {
    //   count: fakeUsers.length,
    //   gender: "female",
    //   to_age: 30,
    //   from_age: 16,
    //   random: true
    // });

    // debugger;
    if (result.isError) {
      console.log("có lỗi");
      await browser.close();
      return res.status(200).send("okie");
    }
    fakeUsers = result.userList;
    for (let i = 0; i < fakeUsers.length; i++) {
      const item = fakeUsers[i];
      const newUser = new accountModel({
        _id: new mongoose.Types.ObjectId(),
        ...item
      });
      await newUser.save();
      console.log(`Đang lưu tài khoản người dùng ${item.username}`);
    }
    await browser.close();
    // debugger;
    return res.status(200).send("okie");
  } catch (error) {
    console.log(error);
    await browser.close();
    return res.status(200).send("okie");
  }
};
exports.addAccount = async (req, res) => {
  try {
    let data = ({
      username,
      email,
      lastName,
      name,
      pass,
      dateOfBirth,
      monthOfBirth,
      yearOfBirth,
      gender,
      facebook,
      cookie,
      proxies,
      userAgents
    } = req.body);
    data.name = data.name.replace(" ", "");
    data.lastName = data.lastName.replace(" ", "");
    data.email = data.email.replace(" ");
    // debugger;
    const account = new accountModel({
      _id: new mongoose.Types.ObjectId(),
      ...data
    });
    const result = await account.save();
    const accounts = await accountModel.find();
    // debugger;
  } catch (error) {
    console.log(error);
    res.status(400).send(error);
    debugger;
  }
  return res.status(200).render("accounts/index");
};
exports.deleteAccount = async (req, res) => {
  const _id = req.params.id.trim();
  try {
    await accountModel
      .findByIdAndRemove(_id)
      .then(result => {
        fs.unlinkSync(
          `${originPath}/puclic/accounts/pictures/${result.profile}`
        );
        // console.log(result);
      })
      .catch(err => {
        console.log(err);
        // return res.status(400).send("Đã có lỗi");
      });
  } catch (err) {
    // console.log(err);
  }
  return res.status(200).send({ message: "success" });
};
exports.updateAccount = async (req, res) => {
  try {
    const accountData = req.body;
    // debugger;
    const account = await accountModel.findByIdAndUpdate(
      { _id: accountData._id },
      accountData
    );
    return res.redirect("/account/detail", 200);
    debugger;
  } catch (error) {
    res.status(400).send({
      error
    });
  }
};
exports.detailAccount = async (req, res) => {
  // debugger;
  try {
    const account = await accountModel.findById(req.params.id);
    let userAgents = await userAgentModel.find();
    let proxies = await proxyModel.find();
    var statuses = Object.values(status);
    if (!account) {
      res.status(400).send({
        error: "không tìm thấy dữ liệu"
      });
    }
    res.render("accounts/detail", {
      account,
      userAgents,
      proxies,
      status: statuses
    });
  } catch (error) {
    console.log(error);
  }
};

exports.checkProxy = async (req, res) => {
  const _id = req.params.id;
  this.checkIp(_id);
  res.status(200).json({
    message: "checking"
  });
};
exports.checkAllProxy = async (req, res) => {
  const accounts = await accountModel
    .find()
    .populate("proxies")
    .populate("userAgents");

  const url = "https://httpbin.org/ip";

  for (let i = 0; i < 15; i++) {
    for (var j = 0; j < accounts.length; j++) {
      global.forkQueue.addQueue({
        path: "controllers/checkIp.js",
        data: {
          account: accounts[j],
          url
        },
        childHandler: msg => {
          // console.log("Message from child", msg.status);
          global.io.emit("checkProxy", {
            status: true,
            id: msg.accountId
          });
        }
      });
    }
  }
  global.forkQueue.DoTasks();

  res.status(200).json({
    message: "checking"
  });
};

exports.checkIp2 = async ({ page, data: url }) => {
  try {
    console.log("go checkIp2");
    await page.goto(url, {
      waitUntil: "networkidle0",
      timeout: 3000
    });
    // global.io.emit("checkProxy", {
    //   status: true,
    //   id: _id
    // });
  } catch (error) {
    // global.io.emit("checkProxy", {
    //   status: false,
    //   id: _id
    // });
    // await page.close();
    // // browser.close();
  }
};
exports.checkIp = async _id => {
  let browser,
    page = null;
  try {
    const url = "https://httpbin.org/ip";
    // debugger;
    const account = await accountModel.findById({
      _id
    });
    const proxyData = await proxyModel.findById({
      _id: account.proxies[0]
    });
    const strProxy = `http://${proxyData.user}:${proxyData.pass}@${
      proxyData.ip
    }:${proxyData.port}`;
    const proxy = await ProxyChain.anonymizeProxy(strProxy);

    const agentData = await userAgentModel.findById({
      _id: account.userAgents[0]
    });

    browser = await puppeteer.launch({
      // headless: false,
      args: [
        "--disable-notifications",
        `--proxy-server=${proxy}`,
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-accelerated-2d-canvas",
        "--disable-gpu",
        "--window-size=1920x1080"
      ]
    });

    page = await browser.newPage();
    await helper.intializePage(page, agentData.agent);
    await page.goto(url, {
      waitUntil: "networkidle0",
      timeout: 5000
    });
    await page.close();
    // browser.close();

    global.io.emit("checkProxy", {
      status: true,
      id: _id
    });
  } catch (error) {
    global.io.emit("checkProxy", {
      status: false,
      id: _id
    });
    await page.close();
    // browser.close();
  }
};
exports.manual = async (req, res) => {
  const _id = req.params.id;
  let browser,
    page = null;
  try {
    // debugger;
    const account = await accountModel
      .findById({
        _id
      })
      .populate("proxies")
      .populate("userAgents");
    const proxyData = account.proxies[0];
    const strProxy = `http://${proxyData.user}:${proxyData.pass}@${
      proxyData.ip
    }:${proxyData.port}`;
    const proxy = await ProxyChain.anonymizeProxy(strProxy);

    const agentData = account.userAgents[0];

    browser = await puppeteer.launch({
      headless: false,
      args: [
        "--disable-notifications",
        `--proxy-server=${proxy}`,
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-accelerated-2d-canvas",
        "--disable-gpu",
        "--window-size=1920x1080"
      ],
      ignoreDefaultArgs: ["--disable-extensions"],
      executablePath:
        "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe"
    });

    page = await helper.newPage(browser, account);
    page.on("close", async () => {
      console.log("page closed");
      const pages = await browser.pages();
      if (pages[0] != undefined && pages[0] != null) {
        const cookies = await helper.getCookies(pages[0]);
        if (cookies && cookies.length > 0) {
          account.cookie = cookies;
          account.save();
        }
      }
    });
    // await helper.intializePage(page, agentData.agent);
    // await page.setExtraHTTPHeaders({
    //   "x-frame-options": 'allow-from https://accounts.google.com"'
    // });
    await page.goto("https://accounts.google.com");
    const content = await page.content();
    return res.send(content);
  } catch (error) {}
};
exports.profileUpload = async (req, res, next) => {
  // debugger;
  const file = req.file;
  // const _id = r
  if (!file) {
    const error = new Error("Please upload a file");
    error.httpStatusCode = 400;
    return next(error);
  }
  res.send(file);
};
exports.loginFirstEmail = async (req, res) => {
  const _id = req.params.id;
  const url = "https://login.microsoftonline.com";
  // debugger;
  const account = await accountModel.findById({
    _id
  });
  const proxyData = await proxyModel.findById({
    _id: account.proxies[0]
  });
  const strProxy = `http://${proxyData.user}:${proxyData.pass}@${
    proxyData.ip
  }:${proxyData.port}`;
  const proxy = await ProxyChain.anonymizeProxy(strProxy);

  const agentData = await userAgentModel.findById({
    _id: account.userAgents[0]
  });

  const actions = [
    {
      selector: 'input[type="email"]',
      type: types.email,
      wait: waitEnum.select,
      description: ""
    },
    {
      selector: 'input[type="submit"]',
      type: types.button,
      wait: waitEnum.navigation,
      description: ""
    },
    {
      selector: 'input[name="passwd"]',
      type: types.passEmail,
      wait: waitEnum.select,
      description: ""
    },
    {
      selector: 'input[type="submit"]',
      type: types.button,
      wait: waitEnum.navigation,
      description: ""
    },
    {
      selector: "#currentPassword",
      type: types.passEmail,
      wait: waitEnum.select,
      description: ""
    },
    {
      selector: "#newPassword",
      type: types.newPass,
      wait: waitEnum.select,
      description: "nhập mật khẩu mới"
    },
    {
      selector: "#confirmNewPassword",
      type: types.confirmPass,
      wait: waitEnum.select,
      description: ""
    },
    {
      selector: "#idSIButton9",
      type: types.button,
      wait: waitEnum.navigation,
      description: "tiếp theo"
    },
    {
      selector: "#idSIButton9",
      type: types.button,
      wait: waitEnum.navigation,
      description: "tiếp theo"
    },
    {
      selector: "#close-welcome-overlay",
      type: types.button,
      wait: waitEnum.navigation,
      description: "đóng trải nghiệm"
    },
    {
      selector: "#first-run-step-0-formstile-close",
      type: types.button,
      wait: waitEnum.navigation,
      description: "đóng trải nghiệm"
    },
    {
      url: "https://outlook.office365.com",
      type: types.url,
      wait: waitEnum.navigation,
      description: "Đăng nhập vào outlook"
    },
    {
      selector: "#selTz",
      type: types.select,
      wait: waitEnum.navigation,
      function: `var op = document.querySelector('#selTz > option[value="SE Asia Standard Time"]')
      op.selected = true
      `,
      description: "chọn múi giờ"
    },
    {
      selector: 'div[onclick="frmSbmt()"]',
      type: types.button,
      await: waitEnum.navigation,
      description: "Lưu"
    },
    {
      selector:
        "body > div.peekShadowAll.peekPopup > div > div > div > div._swb_y > div:nth-child(2) > button",
      type: types.button,
      await: waitEnum.type,
      description: "Không dùng thử"
    },
    {
      type: types.close,
      await: waitEnum.type,
      description: "Thoát"
    }
  ];
  // const selector = [
  //   {
  //     email: 'input[type="email"]',
  //     next: 'input[type="submit"]'
  //   },
  //   {
  //     pass: 'input[name="passwd"]',
  //     login: 'input[type="submit"]'
  //   }
  // ];

  const browser = await puppeteer.launch({
    headless: false,
    args: [
      "--disable-notifications",
      `--proxy-server=${proxy}`,
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-accelerated-2d-canvas",
      "--disable-gpu",
      "--window-size=1920x1080"
    ]
  });

  const page = await browser.newPage();
  await helper.intializePage(page, agentData.agent);
  await page.goto(url, {
    waitUntil: "networkidle0"
  });
  await page.waitFor(800);
  const newPass = `@T${Math.random()
    .toString(36)
    .substr(2, 12)}`;
  try {
    for (let i = 0; i < actions.length; i++) {
      const action = actions[i];

      switch (action.type) {
        case types.email:
          await page.waitFor(human.normalDelayTime());
          await page.waitForSelector(action.selector);
          await page.type(action.selector, account.email, {
            delay: human.typeDelayTime()
          });
          await page.waitFor(human.normalDelayTime());
          console.log(
            `Đang thực hiện bước thứ ${i} chi tiết: ${actions[i].description}`
          );
          break;
        case types.passEmail:
          await page.waitFor(human.normalDelayTime());
          await page.waitForSelector(action.selector);
          await page.type(action.selector, account.pass.email, {
            delay: human.typeDelayTime()
          });
          await page.waitFor(human.normalDelayTime());
          console.log(
            `Đang thực hiện bước thứ ${i} chi tiết: ${actions[i].description}`
          );
          break;
        case types.newPass:
          await page.waitFor(human.normalDelayTime());
          await page.waitForSelector(action.selector);
          await page.type(action.selector, newPass, {
            delay: human.typeDelayTime()
          });
          await page.waitFor(human.normalDelayTime());
          console.log(
            `Đang thực hiện bước thứ ${i} chi tiết: ${actions[i].description}`
          );
          break;
        case types.confirmPass:
          await page.waitFor(human.normalDelayTime());
          await page.waitForSelector(action.selector);
          await page.type(action.selector, newPass, {
            delay: human.typeDelayTime()
          });
          account.pass.email = newPass;
          account.pass.facebook = newPass;
          account.pass.alibaba = newPass;
          await account.save();
          await page.waitFor(human.normalDelayTime());
          console.log(
            `Đang thực hiện bước thứ ${i} chi tiết: ${actions[i].description}`
          );
          break;
        case types.passAlibaba:
          await page.waitFor(human.normalDelayTime());
          await page.waitForSelector(action.selector);
          await page.type(action.selector, account.pass.alibaba, {
            delay: human.typeDelayTime()
          });
          await page.waitFor(human.normalDelayTime());
          break;
        case types.passFacebook:
          await page.waitFor(human.normalDelayTime());
          await page.waitForSelector(action.selector);
          await page.type(action.selector, account.pass.facebook, {
            delay: human.typeDelayTime()
          });
          await page.waitFor(human.normalDelayTime());
          console.log(
            `Đang thực hiện bước thứ ${i} chi tiết: ${actions[i].description}`
          );
          break;
        case types.passFacebook:
          await page.waitFor(human.normalDelayTime());
          await page.waitForSelector(action.selector);
          await page.type(action.selector, account.pass.facebook, {
            delay: human.typeDelayTime()
          });
          await page.waitFor(human.normalDelayTime());
          break;
        case types.name:
          await page.waitFor(human.normalDelayTime());
          await page.waitForSelector(action.selector);
          await page.type(action.selector, account.name, {
            delay: human.typeDelayTime()
          });
          await page.waitFor(human.normalDelayTime());
          console.log(
            `Đang thực hiện bước thứ ${i} chi tiết: ${actions[i].description}`
          );
          break;
        case types.username:
          await page.waitForSelector(action.selector);
          await page.type(action.selector, account.username, {
            delay: human.typeDelayTime()
          });
          await page.waitFor(human.normalDelayTime());
          break;
        case types.lastname:
          await page.waitForSelector(action.selector);
          await page.type(action.selector, account.lastName, {
            delay: human.typeDelayTime()
          });
          await page.waitFor(human.normalDelayTime());
          console.log(
            `Đang thực hiện bước thứ ${i} chi tiết: ${actions[i].description}`
          );
          break;
        case types.fullname:
          await page.waitForSelector(action.selector);
          await page.type(action.selector, account.fullname, {
            delay: human.typeDelayTime()
          });
          await page.waitFor(human.normalDelayTime());
          console.log(
            `Đang thực hiện bước thứ ${i} chi tiết: ${actions[i].description}`
          );
          break;
        case types.button:
          await page.waitForSelector(action.selector);
          await page.waitFor(human.normalDelayTime());
          await page.waitFor(human.normalDelayTime());
          await page.click(action.selector, { delay: human.typeDelayTime() });
          if (action.wait == waitEnum.navigation) {
            await page.waitForNavigation({
              waitUntil: "networkidle2"
            });
          }
          await page.waitFor(human.normalDelayTime());
          console.log(
            `Đang thực hiện bước thứ ${i} chi tiết: ${actions[i].description}`
          );
          break;
        case types.select:
          await page.waitFor(human.normalDelayTime());
          await page.waitForSelector(action.selector);
          await page.waitFor(human.normalDelayTime());
          await page.evaluate(actions.function);
          await page.waitFor(human.normalDelayTime());
          console.log(
            `Đang thực hiện bước thứ ${i} chi tiết: ${actions[i].description}`
          );
          break;
        case types.url:
          debugger;
          await page.goto(action.url);

          await page.waitForNavigation({
            waitUntil: "networkidle2"
          });
          await page.waitFor(human.normalDelayTime());
          await page.waitFor(human.normalDelayTime());
          console.log(
            `Đang thực hiện bước thứ ${i} chi tiết: ${actions[i].description}`
          );
          break;
        case types.close:
          debugger;
          await page.waitFor(human.normalDelayTime());
          const cookies = await helper.getCookies(page);
          account.cookie = cookies;
          await account.save();
          await page.close();
          console.log(
            `Đang thực hiện bước thứ ${i} chi tiết: ${actions[i].description}`
          );
          break;

        default:
          break;
      }
    }
  } catch (error) {
    await page.screenshot({
      path: `${originPath}/reports/getPics-${Date.now}.png`,
      type: "png",
      fullPage: true
    });
    await page.close();
  }
  // await page.waitForSelector(selector.step1.next);
  // await page.type(selector.step1.email, account.email, { delay: 100 });
  // await page.waitFor(300);
  // await page.waitForSelector(selector.step1.next);
  // await page.click(selector.step1.next, { delay: 100 });
};
