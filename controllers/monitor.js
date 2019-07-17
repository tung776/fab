var io = require("../config/socket").getIO();
exports.action = async (req, res) => {
  res.render("monitor/action");
};
exports.index = async (req, res) => {
  res.render("monitor/index");
};
