var router = require("express").Router();
const homeController = require("../controllers/home");
const proxyController = require("../controllers/proxy");
const userAgentController = require("../controllers/userAgent");
const accountController = require("../controllers/account");
const actionController = require("../controllers/action");
const processController = require("../controllers/process");
const monitorController = require("../controllers/monitor");
const statusController = require("../controllers/status");
const chainActionController = require("../controllers/chainAction");
const taskController = require("../controllers/task");
const vipController = require("../controllers/vip");
const multer = require("multer");
const validateToken = require("./api/author").validateToken;

var profileStore = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, "public/accounts/pictures");
  },
  filename: function(req, file, cb) {
    // debugger;
    cb(null, file.originalname);
  }
});

var profileUpload = multer({ storage: profileStore });

router.get("/", homeController.index);
router.use("/api", require("./api"));
router.get("/proxies", validateToken, proxyController.index);
router.post("/proxies", validateToken, proxyController.addProxy);
router.post("/proxies/save", validateToken, proxyController.saveProxy);
router.delete("/proxies/:id", validateToken, proxyController.deleteProxy);

router.get("/userAgent", validateToken, userAgentController.index);
router.post("/userAgent", validateToken, userAgentController.addUserAgent);
router.delete("/userAgent/:id", userAgentController.deleteUserAgent);

router.get("/account", validateToken, accountController.index);
router.get(
  "/account/checkProxy/:id",
  validateToken,
  accountController.checkProxy
);
router.get("/account/manual/:id", validateToken, accountController.manual);
router.get(
  "/account/checkAllProxy",
  validateToken,
  accountController.checkAllProxy
);
router.get("/account/auto", validateToken, accountController.auto);
router.get(
  "/account/createOutlook",
  validateToken,
  accountController.createOutlook
);

router.post("/account", validateToken, accountController.addAccount);
router.get("/account/:id", validateToken, accountController.detailAccount);
router.put("/account/:id", validateToken, accountController.updateAccount);
router.delete("/account/:id", validateToken, accountController.deleteAccount);
router.post(
  "/account/uploadfile",
  validateToken,
  profileUpload.single("profile"),
  accountController.profileUpload
);

router.get(
  "/account/loginFirstEmail/:id",
  validateToken,
  accountController.loginFirstEmail
);
//action
router.get("/action/new", validateToken, actionController.getNewAction);
router.post("/action/new", validateToken, actionController.postNewAction);
router.post("/action/checkCode", validateToken, actionController.checkCode);
router.post("/action/update", validateToken, actionController.updateAction);
router.get("/action", validateToken, actionController.index);
router.delete("/action/:id", validateToken, actionController.removeAction);
router.get("/action/detail/:id", validateToken, actionController.detail);
router.post("/action/doAction", validateToken, actionController.doAction);

//status
router.get("/status", validateToken, statusController.index);
router.delete("/status/:id", validateToken, statusController.deleteStatus);

//process
// router.get("/process", processController.index);
// router.post("/process/update", processController.update);
// router.delete("/process/:id", processController.remove);
// router.get("/process/detail/:id", processController.detail);
//monitor
router.get("/monitor", validateToken, monitorController.index);
router.get("/monitor/action", validateToken, monitorController.action);
router.post(
  "/monitor/sendComment",
  validateToken,
  monitorController.sendComment
);

//chain action
router.get("/chainAction", validateToken, chainActionController.index);
router.get("/chainAction/run/", validateToken, chainActionController.run);
router.post("/chainAction/update", validateToken, chainActionController.update);
router.post(
  "/chainAction/new",
  validateToken,
  chainActionController.newChainAction
);
router.get("/chainAction/new", validateToken, chainActionController.new);
router.delete("/chainAction/:id", validateToken, chainActionController.remove);
router.get("/chainAction/:id", validateToken, chainActionController.detail);

//Task
router.get("/task", validateToken, taskController.index);
router.get("/task/run/:id", validateToken, taskController.run);
router.post("/task/update", validateToken, taskController.update);
router.post("/task/new", validateToken, taskController.newTask);
router.get("/task/new", validateToken, taskController.new);
router.delete("/task/:id", validateToken, taskController.remove);
router.get("/task/:id", validateToken, taskController.detail);
//Vip
router.get("/vip", validateToken, vipController.index);
router.post("/vip/update", validateToken, vipController.update);
router.post("/vip/new", validateToken, vipController.newVip);
router.get("/vip/new", validateToken, vipController.new);
router.delete("/vip/:id", validateToken, vipController.remove);
router.get("/vip/:id", validateToken, vipController.detail);

module.exports = router;
