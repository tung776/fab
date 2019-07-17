var os = require("os");
var mongoose = require("mongoose");
const { NodeVM } = require("vm2");
var accountModel = mongoose.model("Account");
var userAgentModel = mongoose.model("UserAgent");
var proxyModel = mongoose.model("Proxy");
const typeActions = require("../models/enum").typeActions;
const waitEnum = require("../models/enum").waitEnum;
const conditionEnum = require("../models/enum").conditionEnum;
var chainActionModel = mongoose.model("ChainAction");
var actionModel = mongoose.model("Action");
var processAction = require("./processAction");
var fs = require("fs-extra");
var appPath = require("../appPath").originPath;
var path = require("path");
var helper = require("../facebook/actions/helper").helper;
const JSON = require("circular-json");
const processChain = require("./processChain").processChain;

exports.index = async (req, res) => {
  try {
    let chainActions = [];
    chainActions = await chainActionModel.find();
    return res.render("chainAction/index", {
      chainActions: chainActions
    });
  } catch (error) {
    console.log(error);
  }
};

exports.new = async (req, res) => {
  const actions = await actionModel.find();
  return res.render("chainAction/add", {
    actions: actions
  });
};
exports.newChainAction = async (req, res) => {
  try {
    const data = req.body;
    const chainAction = new chainActionModel({
      _id: new mongoose.Types.ObjectId(),
      ...data
    });
    await chainAction.save();
    chainActions = await chainActionModel.find();
    return res.render("chainAction/index", {
      chainActions: chainActions
    });
  } catch (error) {
    res.status(400).json({
      success: false
    });
  }
};

exports.run = async (req, res) => {
  let accountIds = req.body.accountIds;
  let chainActionId = req.body.chainActionId;
  chainActionId = "5d25b3a2c3be831fe0ebe3ee";
  accountIds = [
    "5d05a1200a5e5a2754a822c3",
    "5d05a1200a5e5a2754a822c4",
    "5d05a1200a5e5a2754a822c7",
    "5d05a1200a5e5a2754a822c8",
    "5d05a1200a5e5a2754a822c5"
  ];
  if (!accountIds || accountIds.length <= 0) return;
  try {
    let accounts = await accountModel
      .find({ _id: { $in: accountIds } })
      .populate("proxies")
      .populate("userAgents");
    let chainAction = await chainActionModel
      .findById({
        _id: chainActionId
      })
      .populate("actions.action");

    for (var i = 0; i < accounts.length; i++) {
      const account = accounts[i];
      global.forkQueue.addQueue({
        path: "controllers/processChain.js",
        data: {
          account: account,
          chainAction
        },
        childHandler: msg => {
          // console.log(msg);
          if (msg.next != undefined) {
            if (msg.next) {
              global.io.emit(`workerExit`, {
                accountId: msg.account._id,
                memory: {
                  maxWorkers: global.forkQueue.getMaxWorkers(),
                  memoryUsageAvg: Math.floor(
                    global.forkQueue.getMemoryUsageAvg()
                  ),
                  workersWorking: global.forkQueue.getWorkersWorking(),
                  queues: global.forkQueue.getqueues(),
                  ram: Math.floor(os.freemem() / 1024 / 1024)
                }
              });
            }
          }
          if (msg.memory != undefined && msg.memory !== "") {
            global.io.emit("memory", msg.memory);
          }
          if (msg.status != undefined) {
            if (msg.status == true) {
              global.io.emit(`taskDone`, {
                account: {
                  _id: msg.account._id,
                  name: msg.account.name,
                  username: msg.account.username,
                  email: msg.account.email,
                  facebook: msg.account.facebook,
                  profile: msg.account.profile
                },
                status: msg.status,
                message: msg.message
              });
            } else {
              global.io.emit(`taskDone`, {
                account: {
                  _id: msg.account._id,
                  name: msg.account.name,
                  username: msg.account.username,
                  email: msg.account.email,
                  facebook: msg.account.facebook,
                  profile: msg.account.profile
                },
                status: msg.status,
                message: msg.message,
                error: msg.error
              });
            }
          }
          if (msg.handler != undefined && msg.handler != "") {
            const account = msg.data.account;
            let accountData = null;
            if (account !== undefined && account) {
              accountData = {
                _id: account._id,
                name: account.name,
                username: account.username,
                email: account.email,
                facebook: account.facebook,
                profile: account.profile
              };
            }
            switch (msg.handler) {
              // case "taskQueue":
              // global.io.emit(`taskQueue`, {
              //   maxWorkers: msg.data.maxWorkers,
              //   memoryUsageAvg: msg.data.memoryUsageAvg,
              //   workersWorking: msg.data.workersWorking,
              //   queues: msg.data.queues,
              //   ram: Math.floor(os.freemem() / 1024 / 1024)
              // });
              //   break;
              case "chainAction":
                if (accountData) {
                  global.io.emit(`chainAction`, {
                    account: {
                      _id: accountData._id,
                      name: accountData.name,
                      username: accountData.username,
                      email: accountData.email,
                      facebook: accountData.facebook,
                      profile: accountData.profile
                    },
                    chainAction: {
                      _id: chainAction._id,
                      name: chainAction.name
                    },
                    memory: {
                      maxWorkers: global.forkQueue.getMaxWorkers(),
                      memoryUsageAvg: Math.floor(
                        global.forkQueue.getMemoryUsageAvg()
                      ),
                      workersWorking: global.forkQueue.getWorkersWorking(),
                      queues: global.forkQueue.getqueues(),
                      ram: Math.floor(os.freemem() / 1024 / 1024)
                    }
                  });
                }
                break;
              case "doAction":
                if (account) {
                  global.io.emit(`doAction`, {
                    account: accountData,
                    message: msg.message,
                    step: msg.data.step,
                    memory: {
                      maxWorkers: global.forkQueue.getMaxWorkers(),
                      memoryUsageAvg: Math.floor(
                        global.forkQueue.getMemoryUsageAvg()
                      ),
                      workersWorking: global.forkQueue.getWorkersWorking(),
                      queues: global.forkQueue.getqueues(),
                      ram: Math.floor(os.freemem() / 1024 / 1024)
                    }
                  });
                }
                break;
              case "account":
                global.io.emit("account", {
                  _id: msg.data._id,
                  profile: msg.data.profile,
                  username: msg.data.username,
                  email: msg.data.email,
                  memory: {
                    maxWorkers: global.forkQueue.getMaxWorkers(),
                    memoryUsageAvg: Math.floor(
                      global.forkQueue.getMemoryUsageAvg()
                    ),
                    workersWorking: global.forkQueue.getWorkersWorking(),
                    queues: global.forkQueue.getqueues(),
                    ram: Math.floor(os.freemem() / 1024 / 1024)
                  }
                });
                break;
              case "screenShot":
                if (account) {
                  global.io.emit(`screenShot`, {
                    account: accountData,
                    message: msg.message,
                    screenShot: msg.data.screenShot
                  });
                }
                break;
              case "errorMessage":
                if (account) {
                  global.io.emit(`errorMessage`, {
                    account: accountData,
                    message: msg.message,
                    stack: msg.data.stack,
                    step: msg.data.step,
                    memory: {
                      maxWorkers: global.forkQueue.getMaxWorkers(),
                      memoryUsageAvg: Math.floor(
                        global.forkQueue.getMemoryUsageAvg()
                      ),
                      workersWorking: global.forkQueue.getWorkersWorking(),
                      queues: global.forkQueue.getqueues(),
                      ram: Math.floor(os.freemem() / 1024 / 1024)
                    }
                  });
                }
                break;

              default:
                break;
            }
          }
        }
      });
    }
    global.forkQueue.DoTasks();

    /*
    debug
    */
    // processChain(accounts[0], chainAction);
  } catch (error) {}
  return res.render("monitor/index");
};
exports.update = async (req, res) => {
  try {
    const data = req.body;
    const chainAction = await chainActionModel.findByIdAndUpdate(
      {
        _id: data.id
      },
      data
    );
    chainActions = await chainActionModel.find();
    return res.render("chainAction/index", {
      chainActions: chainActions
    });
  } catch (error) {
    res.status(400).json({
      success: false
    });
  }
};
exports.remove = async (req, res) => {
  try {
    const id = req.params.id;
    const result = await chainActionModel.findByIdAndDelete(id);
    res.status(200).json({
      isSuccess: true,
      error: null
    });
  } catch (error) {
    res.status(400).json({
      isSuccess: false,
      error: null
    });
  }
};
exports.detail = async (req, res) => {
  try {
    const id = req.params.id;
    const chainAction = await chainActionModel.findById({
      _id: id
    });
    //   .populate("actions");
    const actions = await actionModel.find();

    return res.render("chainAction/update", {
      actions: actions,
      chainAction: chainAction
    });
  } catch (error) {
    return res.status(400).json({
      message: "không tìm thấy dữ liệu"
    });
  }
};
