const delay = require("delay");
const parseEmail = require("parse-email");

module.exports = async page => {
  // await page.waitForNavigation({ timeout: 0 })

  // view original message source from the email overflow options menu
  await page.waitFor(1000 * 10);
  // await page.waitFor(
  //   '.allowTextSelection button[aria-label="More mail actions"]',
  //   { visible: true }
  // );
  // await page.click(
  //   '.allowTextSelection button[aria-label="More mail actions"]'
  // );
  await page.waitFor(".allowTextSelection", {
    visible: true
  });
  const contents = await page.$$(".allowTextSelection");
  // const content = await contents[contents.length - 1].contentFrame();
  const content = await page.$$eval(
    ".allowTextSelection",
    $els => $els[$els.length - 1].innerHTML
  );

  try {
    const email = await parseEmail(content);
    return email;
  } catch (err) {
    return null;
  }
};
