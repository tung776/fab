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
const dotenv = require("dotenv");
dotenv.config();

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
exports.createOutlook = async (req, res) => {
  res.send("okie");
  var firstName;
  var lastName;
  var birthday = helper.birthday();
  var charactorArr = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k"];
  var username = "";
  var emailProvider = "outlook.com";

  var proxiesList = await proxyModel.find();
  var err = false;
  let proxyData;
  let browser;
  let page;
  var userAgent;
  let userAgentList = await userAgentModel.find();
  do {
    try {
      err = false;
      proxyData = helper.randomFromArray(proxiesList);
      let strProxy = `http://${proxyData.user}:${proxyData.pass}@${
        proxyData.ip
      }:${proxyData.port}`;
      let proxyStr = await ProxyChain.anonymizeProxy(strProxy);
      browser = await puppeteer.launch({
        headless: false,
        args: [
          "--disable-notifications",
          `--proxy-server=${proxyStr}`,
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
          "--disable-accelerated-2d-canvas",
          "--disable-gpu",
          "--window-size=1920x1080"
        ]
      });

      page = await browser.newPage();
      userAgent = helper.randomFromArray(userAgentList);
      await helper.intializePage(page, userAgent.agent);
      console.log("====================================================== ");
      console.log("proxy = ", `${strProxy}   ${proxyData.location}`);
      console.log("userAgent = ", userAgent.agent);
      console.log("====================================================== ");

      await page.goto("https://signup.live.com/signup");
    } catch (error) {
      err = true;
      console.log(error);
      await page.close();
      await browser.close();
    }
  } while (err);

  // email / username
  // ----------------

  await page.waitFor("#liveSwitch", { visible: true });
  await page.click("#liveSwitch", { delay: 10 });
  await page.waitFor(100);
  let error = null;
  do {
    firstName = helper.firstName();
    lastName = helper.lastName();
    var random = helper.randomFromArray(charactorArr);
    random = random + helper.randomFromArray(charactorArr);
    random = `${random}${Math.floor(helper.randomMin2Max(10, 100))}`;
    username = `${firstName}${lastName}${birthday.year}${
      birthday.day
    }${random}`;
    await page.type("#MemberName", username, { delay: 40 });
    await page.waitFor(250);
    await page.click("#iSignupAction", { delay: 20 });

    await page.waitFor(1000);
    error = await page.$("#MemberNameError");

    // TODO: there is an issue here where if one username fails, the next will
    // always also fail
    if (error) {
      await page.waitFor(1000);
      await page.focus("#MemberName");
      for (let i = 0; i < username.length + 8; ++i) {
        await page.keyboard.press("Backspace");
      }

      await page.waitFor(1000);
    }
  } while (error);
  // password
  // -------------------
  var password = "@Namdinh1";

  await page.waitFor("#Password", { visible: true });
  await page.waitFor(100);
  await page.type("#Password", password, { delay: 10 });
  await page.waitFor(100);
  await page.click("#iOptinEmail", { delay: 10 });
  await page.waitFor(100);
  await page.click("#iSignupAction", { delay: 30 });

  // first and last name
  // -------------------

  await page.waitFor("#FirstName", { visible: true });
  await page.waitFor(100);
  await page.type("#FirstName", firstName, { delay: 30 });
  await page.waitFor(120);
  await page.type("#LastName", lastName, { delay: 35 });
  await page.waitFor(260);
  await page.click("#iSignupAction", { delay: 25 });

  // birth date
  // ----------

  try {
    await page.waitFor("#BirthMonth", { visible: true });
    await page.waitFor(100);
    await page.select("#BirthMonth", `${birthday.month}`);
    await page.waitFor(120);
    await page.select("#BirthDay", `${birthday.day}`);
    await page.waitFor(260);
    await page.select("#BirthYear", `${birthday.year}`);
    await page.waitFor(220);
    await page.click("#iSignupAction", { delay: 8 });
  } catch (error) {
    console.log(error);
  }

  //chờ nhập captcha
  await page.waitFor(1000 * 50); // 50s

  // main account page
  // -----------------

  await page.waitFor(1000);
  await page.goto(
    "https://www.outlook.com/?refd=account.microsoft.com&fref=home.banner.profile"
  );

  var email = `${username}@${emailProvider}`;
  var cookie = await helper.getCookies(page);
  var user = {
    username,
    name: firstName,
    lastName,
    email,
    pass: {
      email: password,
      facebook: password,
      "1688": password,
      alibaba: password,
      other: password
    },
    cookie,
    gender: 1,
    proxies: [proxyData._id],
    userAgents: [userAgent._id]
  };
  const account = new accountModel({
    _id: new mongoose.Types.ObjectId(),
    ...user
  });
  const result = await account.save();

  // email inbox first-run
  // ---------------------

  await page.waitFor(800);

  try {
    await Promise.race([
      page.waitFor(2000),
      page.waitFor(".dialog button.nextButton", { visible: true }),
      page.waitFor(".dialog button.primaryButton", { visible: true })
    ]);
  } catch (error) {
    console.log(error);
  }

  // keep pressing next...
  while (true) {
    if (!(await page.$(".dialog button.nextButton"))) break;
    await page.click(".dialog button.nextButton", { delay: 5 });
    await page.waitFor(220);
  }

  // wait until "let's go" button appears...
  // while (true) {
  //   await page.waitFor(1000);
  //   if (await page.$(".dialog button.primaryButton")) break;
  // }

  // await page.waitFor(120);
  // await Promise.all([
  //   page.waitForNavigation({ timeout: 10000 }),
  //   page.click(".dialog button.primaryButton", { delay: 7 })
  // ]);

  // should now be at https://outlook.live.com/mail/inbox

  // res.send(result);
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
exports.getUsedProxies = async () => {
  const accounts = await accountModel.find().populate("proxies");
  let usedProxies = [];
  accounts.forEach(account => {
    account.proxies.forEach(proxy => {
      let strProxy = `${proxy.ip}:${proxy.port}`;
      // if (!usedProxies.includes()) {
      usedProxies.push({
        account: account,
        proxy: strProxy
      });
      // }
    });
  });
  return usedProxies;
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
    let usedProxies = await this.getUsedProxies();
    let filters = usedProxies.filter(used => {
      let str = `${proxyData.ip}:${proxyData.port}`;
      if (used.proxy == str) {
        return true;
      }
    });
    if (filters.length > 2) {
      console.log("trùng địa chỉ ip");
      console.log("Gồm các tài khoản sau");
      console.log(filters[0].proxy);
      filters.forEach(item => {
        console.log(",", item.account.username);
      });
      return;
    }
    console.log("filters.length = ", filters.length);
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
      executablePath: process.env.executablePath
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
