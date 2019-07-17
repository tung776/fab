var mongoose = require("mongoose");
const { NodeVM } = require("vm2");
var accountModel = mongoose.model("Account");
var userAgentModel = mongoose.model("UserAgent");
var proxyModel = mongoose.model("Proxy");
const typeActions = require("../models/enum").typeActions;
const waitEnum = require("../models/enum").waitEnum;
const conditionEnum = require("../models/enum").conditionEnum;
var actionModel = mongoose.model("Action");
var processAction = require("./processAction");
var fs = require("fs-extra");
var appPath = require("../appPath").originPath;
var path = require("path");

exports.doAction = async (req, res) => {
  let { actionId, acountId } = req.body;
  actionId = actionId.trim();
  acountId = acountId.trim();
  try {
    var p = path.resolve("public/screenShot");
    const account = await accountModel
      .findById(acountId)
      .populate("proxies")
      .populate("userAgents");

    var dir = `${p}\\${account.username}`;
    await fs.ensureDir(dir);
    await fs.emptyDir(dir);

    processAction.runAction(account, actionId);
  } catch (error) {
    global.io.emit("errorMessage", {
      message: `runAction bị thất bại ${JSON.stringify(error)}`
    });
  }
  res.status(200).json({
    message: "đang thực hiện yêu cầu"
  });
};

exports.getNewAction = async (req, res) => {
  var modelSchemas = mongoose.modelSchemas;
  var SchemaNames = Object.keys(modelSchemas);
  var arr = [];
  SchemaNames.forEach(item => {
    const arrayProperties = Object.keys(modelSchemas[item].obj);
    arr.push({
      object: item,
      properties: arrayProperties
    });
  });
  const temp = Object.keys(typeActions);
  return res.render("actions/newAction", {
    objects: arr,
    typeActions: [...temp],
    waitEnum: [...Object.keys(waitEnum)],
    conditionEnum: conditionEnum
  });
};

exports.postNewAction = async (req, res) => {
  try {
    let data = req.body.data;
    const action = new actionModel({
      _id: new mongoose.Types.ObjectId(),
      ...data
    });
    const result = await action.save();
  } catch (error) {
    console.log(error);
    res.status(400).send(error);
  }
  res.status(200).json({
    isSuccess: true,
    error: null
  });
};

exports.detail = async (req, res) => {
  try {
    let id = req.params.id;
    const action = await actionModel.findById(id);
    // action.steps.forEach(step => {
    //   if (step.indexStep == undefined) {
    //     step.indexStep = step.index;
    //   }
    //   if (step.source != undefined) {
    //     if (step.source.documentEval != undefined) {
    //       step.documentEval = step.source.documentEval;
    //     }
    //     if (step.source.customFunction != undefined) {
    //       step.customFunction = step.source.customFunction;
    //     }
    //   }
    // });
    // await action.save();
    var modelSchemas = mongoose.modelSchemas;
    var SchemaNames = Object.keys(modelSchemas);
    var arr = [];
    SchemaNames.forEach(item => {
      const arrayProperties = Object.keys(modelSchemas[item].obj);
      arr.push({
        object: item,
        properties: arrayProperties
      });
    });
    const temp = Object.keys(typeActions);
    res.render("actions/detail", {
      action,
      objects: arr,
      typeActions: [...temp],
      waitEnum: [...Object.keys(waitEnum)],
      conditionEnum: conditionEnum
    });
  } catch (error) {
    console.log(error);
    res.status(400).send(error);
  }
};

exports.removeAction = async (req, res) => {
  try {
    const id = req.params.id;
    const result = await actionModel.findByIdAndDelete(id);
    res.status(200).json({
      isSuccess: true,
      error: null
    });
  } catch (error) {}
};
exports.updateAction = async (req, res) => {
  try {
    const data = req.body.data;
    const result = await actionModel.findByIdAndUpdate(
      {
        _id: data.id
      },
      data
    );
    res.status(200).json({
      isSuccess: true,
      error: null
    });
  } catch (error) {
    res.send(400).status({ error: "đã có lỗi" });
  }
};

exports.index = async (req, res) => {
  try {
    let actions = [];
    actions = await actionModel.find();
    res.render("actions/index", {
      actions: actions
    });
  } catch (error) {
    console.log(error);
  }
};

async function loadDataViaModelName(modelName, querry) {
  try {
    debugger;
    var modelSchemas = mongoose.modelSchemas;
    var SchemaNames = Object.keys(modelSchemas);
    if (SchemaNames.indexOf(modelName) < 0) return null;
    const model = mongoose.model(modelName);
    const data = await model.find(querry);
  } catch (error) {}
}

async function removeCollection(modelName) {
  try {
    debugger;
    var modelSchemas = mongoose.modelSchemas;
    var SchemaNames = Object.keys(modelSchemas);
    if (SchemaNames.indexOf(modelName) < 0) return null;
    const model = mongoose.model(modelName);

    var result = await model.collection.drop();
    debugger;
    return result;
  } catch (error) {
    return false;
  }
}
module.exports.checkCode = async (req, res) => {
  let script = req.body.script;
  let bag = {};
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
    res.json({
      success: true
    });
  } catch (error) {
    res.json({
      success: false,
      error: {
        message: error.message,
        stack: error.stack
      }
    });
  }
};
//mongoose.connection.db.dropCollection("Action")
