const sms = require("./sms");
// const user = require("../data/user.js");

const smsActions = {
  async create(page) {
    await sms.create(page);
  }
};
module.exports = smsActions;
