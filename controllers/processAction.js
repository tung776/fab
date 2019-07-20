var fs = require("fs");
const cheerio = require("cheerio");
const { NodeVM } = require("vm2");
var mongoose = require("mongoose");
require("../models/User");
require("../config/passport");
require("../models/Proxy");
require("../models/Cookie");
require("../models/UserAgent");
require("../models/Account");
require("../models/Action");
require("../models/ChainAction");
require("../models/Status");
mongoose.connect("mongodb://localhost/facebook");
var accountModel = mongoose.model("Account");
var StatusModel = mongoose.model("Status");
var userAgentModel = mongoose.model("UserAgent");
var proxyModel = mongoose.model("Proxy");
const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
puppeteer.use(StealthPlugin());
const axios = require("axios");
const ProxyChain = require("proxy-chain");
var actionModel = mongoose.model("Action");
var conditionEnum = require("../models/enum").conditionEnum;
var waitEnum = require("../models/enum").waitEnum;
var typeStepEnum = require("../models/enum").typeActions;
const helper = require("../facebook/actions/helper").helper;
const human = require("../facebook/actions/humanAction");
const io = require("socket.io")();
var path = require("path");
var appPath = require("../appPath").originPath;
let bag = {};

let screenPath = "";
let publicScreenPath = "";
const pages = [];

exports.runStep = async (curentStep, steps, countLoop, accountId, page) => {
  bag.step = curentStep;
  if (curentStep == null || curentStep == undefined) return;

  sendMessage(
    `Đang khởi chạy bước ${curentStep.indexStep}: ${
      curentStep.description
    } vòng lặp ${countLoop}`,
    "doAction",
    {
      account: bag.account,
      step: bag.step
    }
  );
  let nextStep = null;
  var conditionName = null;
  var conditionCount = null;
  var conditionNext = null;
  if (curentStep.conditionType) {
    conditionName = curentStep.conditionType.name;
    conditionCount = curentStep.conditionType.count;
    conditionNext = curentStep.conditionType.next;
    conditionFunction = curentStep.conditionType.conditionFunction;
  }

  if (!conditionCount || conditionCount < 0) {
    if (bag.result.conditionCount && bag.result.conditionCount > 0) {
      conditionCount = bag.result.conditionCount;
    }
  }

  let counter = countLoop;

  switch (conditionName) {
    case "for":
      /*
        nếu countLoop =< 0 thì đang khởi đầu vòng lặp for
        Nếu countLoop > 0 kết thúc vòng lặp for, bước kế 
        tiếp ngoài vòng lặp for sẽ dc thực hiện
        */
      var filePath = `${screenPath}.${curentStep.indexStep}-${counter}.png`;
      await page.screenshot({
        path: filePath
      });

      sendMessage(``, "screenShot", {
        account: bag.account,
        screenShot: `${publicScreenPath}.${curentStep.indexStep}-${counter}.png`
      });

      if (countLoop <= conditionCount) {
        //trong vòng lặp for
        counter = countLoop + 1;
        nextStep = this.findStep(conditionNext, steps);
      }

      if (countLoop > conditionCount) {
        //trong vòng for
        nextStep = this.findStep(curentStep.next, steps);
      }

      if (nextStep == null || nextStep == undefined) {
        await page.screenshot({
          path: `${screenPath}.${curentStep.indexStep}-${counter}.error.png`
        });
        sendMessage(``, "screenShot", {
          account: bag.account,
          screenShot: `${publicScreenPath}.${
            curentStep.indexStep
          }-${counter}.error.png`
        });

        throw new Error(
          `Bước ${curentStep.indexStep} Không tìm thấy bước kế tiếp trong for`
        );
      }

      break;
    case "if":
      var filePath = `${screenPath}.${curentStep.indexStep}.png`;
      await page.screenshot({
        path: filePath
      });
      sendMessage(``, "screenShot", {
        account: bag.account,
        screenShot: `${publicScreenPath}.${curentStep.indexStep}.png`
      });

      if (await this.runScript(conditionFunction)) {
        nextStep = this.findStep(conditionNext, steps);
      } else {
        nextStep = this.findStep(curentStep.next, steps);
      }
      if (!nextStep) {
        await page.screenshot({
          path: `${screenPath}.${curentStep.indexStep}.error.png`
        });
        sendMessage(``, "screenShot", {
          account: bag.account,
          screenShot: `${publicScreenPath}.${curentStep.indexStep}.error.png`
        });

        throw new Error(
          `Bước ${curentStep.indexStep} Không tìm thấy bước kế tiếp trong if`
        );
      }
      break;
    case "end_for":
      /*
        1. nếu countLoop < 0 => vòng lặp for kết thúc
        bước tiếp là giá trị currentStep.next
        2. nếu countLoop > 0 thì vẫn trong vòng lặp for
        bước tiếp là giá trị currentStep.conditionType.next
        nếu không tìm thấy currentStep.conditionType.next thì định
        nghĩa điều kiện for gặp lỗi
        */
      var filePath = `${screenPath}.${curentStep.indexStep}-${counter}.png`;
      await page.screenshot({
        path: filePath
      });
      sendMessage(``, "screenShot", {
        account: bag.account,
        screenShot: `${publicScreenPath}.${curentStep.indexStep}-${counter}.png`
      });

      if (countLoop < 0) {
        nextStep = this.findStep(curentStep.next, steps);
      } else {
        nextStep = this.findStep(conditionNext, steps);
        if (!nextStep) {
          await page.screenshot({
            path: `${screenPath}.${curentStep.indexStep}-${counter}.error.png`
          });
          sendMessage(``, "screenShot", {
            account: bag.account,
            screenShot: `${publicScreenPath}.${
              curentStep.indexStep
            }-${counter}.error.png`
          });

          throw new Error(
            `Bước ${
              curentStep.indexStep
            } Không tìm thấy bước kế tiếp trong end_for`
          );
        }
      }
      break;

    default:
      //conditionName = "" và conditionName = null và end_if
      nextStep = this.findStep(curentStep.next, steps);
      break;
  }

  try {
    await this.processStep(curentStep, accountId, page, counter);
  } catch (error) {
    await page.screenshot({
      path: `${screenPath}.${counter}.error.png`
    });
    sendMessage(``, "screenShot", {
      account: bag.account,
      screenShot: `${publicScreenPath}.${counter}.error.png`
    });
    sendMessage(`${error.message}`, "errorMessage", {
      account: bag.account,
      step: bag.step,
      screenShot: `${publicScreenPath}.${counter}.error.png`,
      message: `${error.message}`,
      stack: `${error.stack}`
    });
  }
  await this.runStep(nextStep, steps, counter, accountId, page);
};

exports.processStep = async (step, accountId, page, countLoop) => {
  bag.countLoop = countLoop;
  bag.step = step;
  //   debugger;
  let typeStep = step.actionType;
  let wait = step.wait;
  // let modelObject = step.source.modelObject;
  let selector = step.selector;
  let url = step.url;
  let customFunction = step.customFunction;
  let documentEval = step.documentEval;

  modelObject = {
    name: "Account",
    property: "email"
  };

  if (customFunction && customFunction != "") {
    let func;
    try {
      func = await this.runScript(customFunction, accountId);
    } catch (error) {
      throw new Error(
        `Đã có lỗi tại bước ${step.indexStep} \n ${error.message} \n ${
          error.stack
        }`
      );
    }
    if (customFunction.includes("async")) {
      try {
        await func();
      } catch (error) {
        throw new Error(
          `Đã có lỗi tại bước ${step.indexStep} \n ${error.message} \n ${
            error.stack
          }`
        );
      }
    } else {
      try {
        func();
      } catch (error) {
        throw new Error(
          `Đã có lỗi tại bước ${step.indexStep} \n ${error.message} \n ${
            error.stack
          }`
        );
      }
    }
  }

  var dataFromScript = bag.result.text;
  let contentText = "";
  if (dataFromScript) {
    if (Array.isArray(dataFromScript)) {
      contentText = dataFromScript[`${countLoop}`][`${step.indexStep}`];
    } else {
      contentText = dataFromScript;
      if (contentText == undefined) contentText = "";
      if (typeof contentText == "boolean") contentText = "";
    }
  }

  if (contentText == undefined) contentText = "";
  if (typeof contentText == "boolean") contentText = "";

  var dataSelector = bag.result.selector;

  if (selector == "{{selector}}" || selector == "") {
    if (dataSelector) {
      if (Array.isArray(dataSelector)) {
        selector = dataSelector[`${countLoop}`][`${step.indexStep}`];
      } else {
        selector = dataSelector;
      }
    }
  }
  if (selector == undefined) selector = "";
  if (typeof selector == "boolean") selector = "";

  switch (typeStep) {
    case typeStepEnum.text:
      if (!(await this.hasElement(selector, page))) {
        await page.screenshot({
          path: `${screenPath}.${step.indexStep}.error.png`
        });
        throw new Error(
          `bước ${
            step.indexStep
          } không tìm thấy thẻ tương ứng với selector : ${selector}`
        );
      }
      await page.waitFor(human.normalDelayTime());
      await page.waitForSelector(selector);
      if (documentEval && documentEval != "") {
        await page.evaluate(documentEval);
      }
      if (contentText && contentText != "") {
        await page.type(selector, contentText, {
          delay: human.typeDelayTime()
        });
        contentText = "";
      }

      var filePath = `${screenPath}.${step.indexStep}.png`;
      await page.screenshot({
        path: filePath
      });
      sendMessage(``, "screenShot", {
        account: bag.account,
        screenShot: `${publicScreenPath}.${step.indexStep}.png`
      });
      await page.waitFor(human.normalDelayTime());
      break;
    case typeStepEnum.button:
      if (!(await this.hasElement(selector, page))) {
        let filePath = `${screenPath}.${step.indexStep}.error.png`;
        await page.screenshot({
          path: filePath
        });
        sendMessage(``, "screenShot", {
          account: bag.account,
          screenShot: `${publicScreenPath}.${step.indexStep}.error.png`
        });

        throw new Error(
          `Bước ${
            step.indexStep
          } không tìm thấy thẻ tương ứng với selector : ${selector}`
        );
      }
      await page.waitFor(human.normalDelayTime());
      await page.waitForSelector(selector);
      await page.click(selector);
      await page.waitFor(2000);
      await page.waitFor(human.normalDelayTime());
      await page.screenshot({
        path: `${screenPath}.${step.indexStep}.png`
      });
      sendMessage(``, "screenShot", {
        account: bag.account,
        screenShot: `${publicScreenPath}.${step.indexStep}.png`
      });
      break;
    case typeStepEnum.select:
      if (!(await this.hasElement(selector, page))) {
        await page.screenshot({
          path: `${screenPath}.${step.indexStep}.error.png`
        });
        sendMessage(``, "screenShot", {
          account: bag.account,
          screenShot: `${publicScreenPath}.${step.indexStep}.error.png`
        });
        throw new Error(
          `Bước ${
            step.indexStep
          } không tìm thấy thẻ tương ứng với selector : ${selector}`
        );
      }
      await page.waitFor(human.normalDelayTime());
      await page.waitForSelector(selector);
      await page.click(selector);
      await page.waitFor(human.shortDelayTime());
      await page.evaluate(documentEval);
      await page.screenshot({
        path: `${screenPath}.${step.indexStep}.png`
      });
      await page.waitFor(human.normalDelayTime());
      break;
    case typeStepEnum.url:
      if (!url.includes("http") || !url.includes("https"))
        url = `https://${url}`;
      await page.goto(`${url}`, {
        waitUntil: "networkidle0"
      });
      await page.waitFor(800);
      var filePath = `${screenPath}.${step.indexStep}.png`;
      await page.screenshot({
        path: filePath
      });
      sendMessage(``, "screenShot", {
        account: bag.account,
        screenShot: `${publicScreenPath}.${step.indexStep}.png`
      });

      await page.waitFor(human.normalDelayTime());
      break;
    case typeStepEnum.close:
      await this.closePage(page);
      break;
    case typeStepEnum.custom:
      break;

    default:
      break;
  }
};

exports.findStep = (indexStep, steps) => {
  //   debugger;
  for (var i = 0; i < steps.length; i++) {
    if (steps[i].indexStep == indexStep) return steps[i];
  }
};

exports.closePage = async page => {
  sendMessage(`Đang lưu cookie`, "doAction", {
    account: bag.account,
    step: bag.step
  });
  let browser = null;
  try {
    const cookies = await helper.getCookies(page);
    bag.account.cookie = [];
    bag.account.cookie = cookies;

    await helper.saveOneData(
      {
        model: "Account",
        querry: {
          _id: bag.account._id
        }
      },
      bag.account
    );
    browser = page.browser();
    await page.close();
    sendMessage(`Đang đóng trình duyệt`, "doAction", {
      step: bag.step,
      account: bag.account
    });
    await browser.close();
  } catch (error) {
    var filePath = `${screenPath}.closePage.error.png`;
    await page.screenshot({
      path: filePath
    });
    sendMessage(``, "screenShot", {
      account: bag.account,
      screenShot: `${publicScreenPath}.closePage.error.png`
    });
    sendMessage(`${error.message}`, "errorMessage", {
      account: bag.account,
      step: bag.step,
      screenShot: `${publicScreenPath}.${counter}.error.png`,
      message: `${error.message}`,
      stack: `${error.stack}`
    });
    browser.close();
  }
};

sendMessage = (message, handler, data) => {
  if (global != undefined && global.io !== undefined) {
    global.io.emit(handler, {
      message: message,
      data: data
    });
  }
  if (process !== undefined) {
    process.send({
      message: message,
      handler: handler,
      data: data
    });
  }
};
exports.runAction = async (account, action, page, context) => {
  if (context != undefined) {
    bag = context;
  } else {
    bag.result = {};
  }
  bag.statusModel = StatusModel;
  acountId = account._id;
  const actionId = action._id;

  sendMessage(`Đang lấy thông tin tài khoản ${account.username}`, "doAction", {
    accountId: `${account._id}`,
    step: bag.step,
    account: bag.account
  });
  sendMessage(
    `${account.username} Đang khởi chạy action ${action.name}`,
    "doAction",
    {
      accountId: `${account._id}`,
      step: bag.step,
      account: bag.account
    }
  );
  const date = new Date();
  screenPath = `${appPath}\\public\\screenShot\\${
    account.username
  }\\${date.getDate()}-${date.getMonth()}-step`;
  publicScreenPath = `${
    account.username
  }/${date.getDate()}-${date.getMonth()}-step`;

  const steps = action.steps;
  let curentStep = steps[0];
  let nextStep = null;

  bag.page = page;
  bag.browser = page.browser();
  bag.accountId = acountId;
  bag.mongoose = mongoose;
  bag.account = account;

  bag.helper = helper;
  bag.human = human;
  bag.cheerio = cheerio;
  sendMessage(``, "account", {
    profile: account.profile,
    username: account.username,
    email: account.email,
    _id: account._id,
    facebook: account.facebook,
    name: account.name
  });
  try {
    await this.runStep(curentStep, steps, 0, acountId, page);
  } catch (error) {
    var filePath = `${screenPath}.runAction.error.png`;
    await page.screenshot({
      path: filePath
    });
    sendMessage(``, "screenShot", {
      account: bag.account,
      screenShot: `${publicScreenPath}.runAction.error.png`
    });
    sendMessage(
      `runAction bước ${curentStep.indexStep} bị thất bại ${error.message}`,
      "errorMessage",
      {
        account: bag.account,
        message: `runAction bước ${curentStep.indexStep} bị thất bại ${
          error.message
        }`,
        stack: `runAction bước ${curentStep.indexStep} bị thất bại ${
          error.stack
        }`
      }
    );
  }
  // await this.closePage(page);
  //   debugger;
};

exports.runScript = async (script, accountId, page) => {
  const vm = new NodeVM({
    console: "inherit",
    timeout: 9000,
    sandbox: { bag },
    require: {
      external: true,
      builtin: ["fs", "path"],
      root: "./",
      mock: {
        fs: {
          readFileSync() {
            return "Nice try!";
          }
        }
      }
    }
  });
  try {
    let functionInSandbox = vm.run(script);

    return functionInSandbox;
  } catch (error) {
    let curentStepString = "";
    if (bag.step && bag.step.indexStep != undefined)
      curentStepString = `Bước ${bag.step.indexStep}`;
    sendMessage(`${curentStepString} ${error.message}`, "errorMessage", {
      account: bag.account,
      step: bag.step,
      message: `${curentStepString} ${error.message}`,
      stack: `${error.stack}`
    });
  }
  //   process.on("uncaughtException", err => {
  //     console.error("Asynchronous error caught.", err);
  //   });
};

exports.hasElement = async (selector, page) => {
  const content = await page.content();
  if (!content || content == "") return false;
  const $ = cheerio.load(content);
  var elements = $(selector);
  if (elements && elements.length > 0) {
    return true;
  }
  return false;
};

exports.saveData = async (querries, accountData) => {
  try {
    helper.saveOneData(querries, accountData);
  } catch (error) {
    console.log("Đã có lỗi: ", error);
  }
};
