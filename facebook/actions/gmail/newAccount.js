const signUpUrl =
  "https://accounts.google.com/signup/v2/webcreateaccount?service=mail&continue=https%3A%2F%2Fmail.google.com%2Fmail%2F&ltmpl=default&gmb=exp&biz=false&flowName=GlifWebSignIn&flowEntry=SignUp";
const faceUser = require("../user");
const createNewAccountForm = {
  lastName: "#lastName",
  firstName: "#firstName",
  email: "#username",
  pass: "input[name='Passwd']",
  pass: "input[name='ConfirmPasswd']",
  nextBtn: "#accountDetailsNext"
};
module.exports = {
  async create(page) {
    const faceUserInfo = await faceUser.getFakeName(page);
    if (page.url() != signUpUrl) await page.goto(signUpUrl);
    console.log(faceUserInfo);
  }
};
