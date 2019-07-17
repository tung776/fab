const newAccount = require("./newAccount");
// const user = require("../data/user.js");

const gmailActions = {
  async create(page) {
    await newAccount.create(page);
  }
};
module.exports = gmailActions;
