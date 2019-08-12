const delay = require("delay");
const ow = require("ow");
const pMap = require("p-map");
const cheerio = require("cheerio");

const getEmail = require("./getMail");

module.exports = async opts => {
  const { page, query } = opts;

  // ow(query, ow.string.nonEmpty.label("query"));

  try {
    console.log(" đang mở trình duyệt: https://outlook.live.com/mail/inbox");
    await page.goto("https://outlook.live.com/mail/inbox");
    await delay(3000);

    // search for an input query to narrow down email results
    // TODO: don't require a search query
    const inputSelector = "#searchBoxId input";

    let buttonSearchSelector = 'button[aria-label="Tìm kiếm"]';
    let content = await page.content();
    const $ = cheerio.load(content);
    const lang = $("html").attr("lang");
    if (lang == "vi") {
      buttonSearchSelector = 'button[aria-label="Tìm kiếm"]';
    }
    if (lang == "en") {
      buttonSearchSelector = 'button[aria-label="Search"]';
    }
    await page.waitFor(inputSelector, { visible: true });
    await delay(2000);

    let attempts = 0;
    do {
      await page.focus(inputSelector);
      await page.click(inputSelector);
      await page.waitFor(buttonSearchSelector);
      await page.type(inputSelector, query, { delay: 7 });

      const value = await page.$eval(inputSelector, el => el.value);
      if (value.trim() === query.trim()) {
        break;
      }

      if (++attempts > 3) {
        throw new Error(`unable to search for query "${query}"`);
      }

      // erase current input
      await page.focus(inputSelector);
      for (let i = 0; i < value.length + 8; ++i) {
        await page.keyboard.press("Backspace");
      }
      await delay(200);
    } while (true);

    // await page.waitForNavigation({ timeout: 0 })

    await page.click(buttonSearchSelector);
    console.log("đang tìm thư");
    console.log("Đang chờ: [data-convid] > div > div");
    try {
      await page.waitFor("[data-convid] > div > div", { timeout: 20000 });
    } catch (error) {}
    // await delay(40000);
    try {
      await page.waitForNavigation();
    } catch (error) {}
    await page.waitFor(2000);

    const $emails = await page.$$("[data-convid] > div > div");

    // fetch and parse individual emails
    const emails = await pMap(
      $emails,
      async $email => {
        await Promise.all([page.waitForNavigation(), $email.click()]);

        return getEmail(page);
      },
      {
        concurrency: 1
      }
    );

    // await page.close();
    console.log("emails.length = ", emails.length);
    return emails;
  } catch (err) {
    // await page.close();
    throw err;
  }
};
