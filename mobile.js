module.exports = async function() {
  const browser2 = bag.page.browser();
  const page2 = await browser2.newPage();
  await page2.waitFor(500);
  const smsUrl = "https://receive-smss.com/";
  await page2.goto(smsUrl, { waitUntil: "networkidle2" });
  await page2.waitFor(500);
  const loginBtn = 'a[href="https://receive-smss.com/login"]';
  const userName = 'input[id="userNameInput user_login"]';
  const pass = 'input[id="passwordInput user_pass"]';
  const submitBtn = "#wp-submit";

  if (findElements(loginBtn).length > 0) {
    await page2.click(loginBtn);
    await page2.waitForNavigation({
      waitUntil: "networkidle0"
    });
    await page2.waitFor(500);
    if (findElements(loginBtn).length > 0) {
      await page2.type(userName, "thanhtung776@gmail.com", {
        delay: 100
      });
      await page2.waitFor(300);
      await page2.type(pass, "tung1221982", {
        delay: 100
      });
      await page2.waitFor(300);
      await page2.click(submitBtn);
      await page2.waitForNavigation({
        waitUntil: "networkidle0"
      });
    }

    await page2.waitFor(800);
    await page2.goto("https://receive-smss.com/", {
      waitUntil: "networkidle0"
    });
    var $ = bag.cheerio.load(page2.content());
    var phones = $(".number-boxes > a");
    var phone = phones[Math.floor(Math.random() * phones.length)];
    bag.account.phone = "+" + phone;
    await bag.account.save();
    bag.page2 = page2;
  }
};

function findElements(content, selector) {
  const $ = bag.cheerio.load(content);
  const els = $(selector);
  return els;
}
async function clickBnt(page2, selector) {
  if (findElements(page2.content(), selector).length > 0) {
    await page2.waitForSelector(selector);
    await page2.click(selector, { delay: 100 });
  }
}

Gmail;
input;
