const cheerio = require("cheerio");
const outlookLoginSelector = require("../data/outlook").outlook.outlookLogin;
const fakeData = require("../data/fakeData").fakeData.user;
const helper = require("./helper").helper;

const outlook = {};
outlook.login = async page => {
  //   await page.addScriptTag({ path: __dirname + "/helper" });

  await page.goto(outlookLoginSelector.url);
  await page.waitForSelector(outlookLoginSelector.next);
  const result = await helper.findElements(
    page,
    outlookLoginSelector.otherAccount
  );
  if (result.length > 0) {
    await page.waitForSelector(outlookLoginSelector.otherAccount);
    await page.click(outlookLoginSelector.otherAccount, { delay: 100 });
    await page.waitForNavigation();
  }
  await page.type(outlookLoginSelector.email, fakeData.email, { delay: 100 });
  await page.waitFor(300);
  await page.waitForSelector(outlookLoginSelector.next);
  await page.click(outlookLoginSelector.next, { delay: 100 });
  await page.waitForNavigation();
  await page.waitFor(300);
  // debugger;
  await page.type(outlookLoginSelector.pass, fakeData.pass, { delay: 100 });
  await page.waitFor(300);
  await page.waitForSelector(outlookLoginSelector.next);
  await page.click(outlookLoginSelector.next, { delay: 100 });
  await page.waitFor(300);
  await page.waitForSelector(outlookLoginSelector.next);
  await page.click(outlookLoginSelector.next, { delay: 100 });
  await page.waitForNavigation();
  await page.waitFor(300);
  await page.goto(outlookLoginSelector.mailUrl);
  // await page.waitForNavigation();

  // debugger;
  let facebookCode = "";
  facebookCode = await outlook.getCode(page, outlookLoginSelector);

  if (facebookCode == "") {
    await page.waitForSelector(outlookLoginSelector.otherMail);
    await page.waitFor(300);
    await page.click(outlookLoginSelector.otherMail, { delay: 100 });
    await page.waitForSelector(outlookLoginSelector.headerEmail);
    await page.waitFor(300);
    // await page.waitForNavigation();
    await page.waitFor(300);

    facebookCode = await outlook.getCode(page, outlookLoginSelector);
  }

  // const emails = await page.$$(outlookLoginSelector.headerEmail);
  // if (emails.length > 0) {
  //   emails.forEach(mail => {
  //     console.log(mail.innerText);
  //   });
  // }

  await page.close();
  return facebookCode;
  // console.log("fackebook code: ", facebookCode);
  // // await page.waitForNavigation();
  // debugger;
};

outlook.getCode = async (page, outlookLoginSelector) => {
  let facebookCode = "";
  const content = await page.content();
  const $ = cheerio.load(content);
  let emails = await helper.findElements(
    page,
    outlookLoginSelector.headerEmail
  );

  for (let i = 0; i < emails.length; i++) {
    let emailContent = $(emails[i]).text();
    // debugger;
    if (emailContent.includes(outlookLoginSelector.facebookEmailConfirm)) {
      facebookCode = emailContent.replace(
        outlookLoginSelector.facebookEmailConfirm,
        ""
      );
      facebookCode = facebookCode.trim();
      break;
    }
  }
  return facebookCode;
};
module.exports.outlook = outlook;
