var os = require("os");
var mongoose = require("mongoose");
var taskModel = mongoose.model("Task");
var accountModel = mongoose.model("Account");
var actionModel = mongoose.model("Action");
var chainActionModel = mongoose.model("ChainAction");
var processAction = require("./processAction");
var fs = require("fs-extra");
var appPath = require("../appPath").originPath;
var path = require("path");
var helper = require("../facebook/actions/helper").helper;
exports.run = async (req, res) => {
  try {
    const id = req.params.id;
    const task = await taskModel.findById({
      _id: id
    });
    const chainActionId = task.chainAction;
    const accountIds = task.accounts;
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
      let bag = {
        result: {}
      };
      const account = accounts[i];
      global.forkQueue.addQueue({
        path: "controllers/processChain.js",
        data: {
          account: account,
          chainAction,
          bag
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
                var p = path.resolve("logs");
                var dir = "";

                if (account) {
                  dir = `${p}/${account.username}`;
                  fs.ensureDir(dir)
                    .then(() => {
                      fs.writeJson(`${dir}/error.json`, {
                        message: msg.message,
                        step: msg.data.step,
                        stack: msg.data.stack
                      })
                        .then(() => {
                          console.log("success!");
                        })
                        .catch(err => {
                          console.error(err);
                        });
                    })
                    .catch();

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
                } else {
                  dir = `${p}`;
                  fs.ensureDir(dir)
                    .then(() => {
                      fs.writeJson(`${dir}/error.json`, {
                        message: msg.message,
                        step: msg.data.step,
                        stack: msg.data.stack
                      })
                        .then(() => {
                          console.log("success!");
                        })
                        .catch(err => {
                          console.error(err);
                        });
                    })
                    .catch();
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
    return res.render("monitor/index");
  } catch (error) {}
};
exports.index = async (req, res) => {
  try {
    let tasks = [];
    tasks = await taskModel.find();
    return res.render("task/index", {
      tasks: tasks
    });
  } catch (error) {
    console.log(error);
  }
};
exports.update = async (req, res) => {
  try {
    const data = req.body;
    const task = await taskModel.findByIdAndUpdate(
      {
        _id: data.id
      },
      data
    );
    tasks = await taskModel.find();
    return res.render("task/index", {
      tasks: tasks
    });
  } catch (error) {
    res.status(400).json({
      success: false
    });
  }
};
exports.newTask = async (req, res) => {
  try {
    const data = req.body;
    const task = new taskModel({
      _id: new mongoose.Types.ObjectId(),
      ...data
    });
    await task.save();
    tasks = await taskModel.find();
    return res.render("chainAction/index", {
      tasks: tasks
    });
  } catch (error) {
    res.status(400).json({
      success: false
    });
  }
};
exports.new = async (req, res) => {
  const accounts = await accountModel.find({
    status: { $not: /checkpoint/ }
  });
  const chainActions = await chainActionModel.find();
  return res.render("task/add", {
    accounts: accounts,
    chainActions
  });
};
exports.remove = async (req, res) => {
  try {
    const id = req.params.id;
    const result = await taskModel.findByIdAndDelete(id);
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
    const chainActions = await chainActionModel.find();
    const task = await taskModel
      .findById({
        _id: id
      })
      .populate("accounts");
    //   .populate("actions");
    const accounts = await accountModel.find({
      status: { $not: /checkpoint/ }
    });
    return res.render("task/update", {
      accounts: accounts,
      task: task,
      chainActions: chainActions
    });
  } catch (error) {
    return res.status(400).json({
      message: "không tìm thấy dữ liệu"
    });
  }
};
