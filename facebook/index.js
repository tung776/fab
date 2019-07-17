const puppeteer = require("puppeteer-extra");
const ProxyChain = require("proxy-chain");
// const proxies = require("./data/proxies");
// Add stealth plugin and use defaults (all tricks to hide puppeteer usage)
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
puppeteer.use(StealthPlugin());
// Add plugin to anonymize the User-Agent and signal Windows as platform
const UserAgentPlugin = require("puppeteer-extra-plugin-anonymize-ua");
const actions = require("./actions");
const baseURL = "https://facebook.com/";
const fakeUser = require("./actions/user");
const gmail = require("./actions/gmail");
const sms = require("./actions/sms");
const getPics = require("./actions/getFemalePic");
const faceActions = require("./actions/facebook");
const outlookActions = require("./actions/outlook").outlook;
const proxy = require("./data/ip");
const fakeData = require("./data/fakeData").fakeData.user;
const helper = require("./actions/helper").helper;
const agent = require("./data/userAgent");

const uas = [
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.139 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36"
];

const proxies = ["113.161.186.101:8080", "14.248.83.218:8080"];

(async () => {
  const IP = await proxy.anonymizeProxy();
  const browser = await puppeteer.launch({
    headless: false,
    args: [
      "--disable-notifications",
      `--proxy-server=${IP}`,
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-accelerated-2d-canvas",
      "--disable-gpu",
      "--window-size=1920x1080"
    ]
  });

  const page1 = await browser.newPage();
  await helper.intializePage(page1, agent.getRandomAgents());
  // await page1.goto("https://whatismyip.network/");
  // debugger;
  const email = fakeData.email.toLowerCase();

  if (email.includes("@soncattuong.com")) {
    // debugger;
    await faceActions.facebook.createNew(page1, browser);
    await page1.waitFor(3000);
  }

  // const userList = await fakeUser.fakeUsersToCSV(page1, 1);
  // await getPics.getPics(page1, userList);
  // await gmail.create(page1);
  // await sms.create(page1);

  // const browser1 = await puppeteer.launch({
  //   headless: false,
  //   args: [
  //     "--disable-notifications",
  //     `--proxy-server=${proxies[1]}`,
  //     "--no-sandbox",
  //     "--disable-setuid-sandbox",
  //     "--disable-dev-shm-usage",
  //     "--disable-accelerated-2d-canvas",
  //     "--disable-gpu",
  //     "--window-size=1920x1080"
  //   ]
  // });
  // const page2 = await browser1.newPage();
  // await page2.setUserAgent(uas[1]);
  // await intializePage(page2);

  // await page.goto(baseURL);

  // await testing.testing(page);

  // await register.register(page);
  /**/
  // const loginResult = await actions.login(
  //   `${baseURL}`,
  //   page1,
  //   user.LoginInfor.email,
  //   user.LoginInfor.pass
  // );

  // const loginResult2 = await actions.login(
  //   `${baseURL}`,
  //   page2,
  //   "trantung@soncattuong.com",
  //   "tung1221982"
  //   // "baongoc2014"
  // );
  /*
      const homeResult = await actions.home.profile.goHomePage(
        baseURL,
        page,
        user.LoginInfor.email
      );
      await page.waitFor(300);
  
      const invitedFriendResult = await actions.home.profile.acceptInvitedFriends(
        page
      );
      */

  // await browser.close();
})();
