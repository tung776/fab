const smsLoginUrl = "https://receive-smss.com/login/";
const smsLoginInfo = {
  username: "Tung776",
  pass: "tung1221982"
};
const smsLoginInfoForm = {
  username: "input[id='userNameInput user_login']",
  pass: "input[id='passwordInput user_pass']",
  loginBtn: "button[id='wp-submit']"
};
const faceUser = require("../user");
const createNewAccountForm = {
  lastName: "#lastName",
  firstName: "#firstName",
  email: "#username",
  pass: "input[name='Passwd']",
  pass: "input[name='ConfirmPasswd']",
  nextBtn: "#accountDetailsNext"
};
const phoneBoxes = "a.number-boxes-item-button";

module.exports = {
  async create(page) {
    if (page.url() != smsLoginUrl) {
      await page.goto(smsLoginUrl);
    }
    await page.waitForSelector(smsLoginInfoForm.username);
    await page.type(smsLoginInfoForm.username, smsLoginInfo.username, {
      delay: 50
    });
    await page.type(smsLoginInfoForm.pass, smsLoginInfo.pass, {
      delay: 50
    });
    await page.click(smsLoginInfoForm.loginBtn, {
      delay: 50
    });
    await page.waitForNavigation();
    if (page.url().includes("login")) return;
    await page.waitForSelector(phoneBoxes);
    let phoneNumbers = [];
    phoneNumbers = await page.$$eval(phoneBoxes, e =>
      e.map(a => a.href.replace("https://receive-smss.com/sms/", ""))
    );
  }
};
