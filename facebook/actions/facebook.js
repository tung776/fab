const Selector = require("../data/facebookSelector");
const fakeData = require("../data/fakeData").fakeData.user;
const outlookActions = require("../actions/outlook");
const agent = require("../data/userAgent");
const helper = require("./helper").helper;

module.exports.facebook = {
  createNew: async (page, browser) => {
    debugger;
    const newAccoutSelector = Selector.facebook.createNew;
    console.log(newAccoutSelector);
    const url = newAccoutSelector.url;
    await page.goto(url, { waitUntil: "networkidle2" });
    await page.waitForSelector(newAccoutSelector.submit);
    await page.type(newAccoutSelector.lastName, fakeData.lastName, {
      delay: 50
    });
    await page.type(newAccoutSelector.firstname, fakeData.name, {
      delay: 50
    });
    await page.type(newAccoutSelector.email, fakeData.email, {
      delay: 50
    });
    await page.type(newAccoutSelector.confirmEmail, fakeData.email, {
      delay: 50
    });
    await page.type(newAccoutSelector.pass, fakeData.pass, {
      delay: 50
    });
    // await page.click(`${newAccoutSelector.dateOfBirth}`, {
    //   delay: 100
    // });
    const dateSelector = `option[value ="${fakeData.dateOfBirth}"]`;
    // await page.waitForSelector(
    //   `${newAccoutSelector.dateOfBirth} > ${dateSelector}`
    // );
    await page.type(
      `${newAccoutSelector.dateOfBirth} > ${dateSelector}`,
      fakeData.dateOfBirth,
      {
        delay: 50
      }
    );
    if (fakeData.gender == 2) {
      await page.click(newAccoutSelector.maleSelect, {
        delay: 50
      });
    } else {
      await page.click(newAccoutSelector.femaleSelect, {
        delay: 50
      });
    }
    // debugger;
    await page.click(newAccoutSelector.submit);
    await page.waitForSelector(newAccoutSelector.confirmBirthDay);
    await page.waitFor(500);
    await page.click(newAccoutSelector.confirmBirthDay);
    const email = fakeData.email.toLowerCase();
    if (email.includes("@soncattuong.com")) {
      const page2 = await browser.newPage();
      await helper.intializePage(page2, agent.getRandomAgents());

      const code = await outlookActions.outlook.login(page2);
      await page2.close();
      console.log("code fakebook = ", code);
      await page.waitForSelector(newAccoutSelector.code);
      await page.type(newAccoutSelector.code, code, { delay: 100 });
      await page.click(newAccoutSelector.submit);
    }
  }
};
