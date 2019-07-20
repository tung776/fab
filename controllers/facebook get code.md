module.exports = async function() {
const helper = bag.helper;
const browser2 = bag.page.browser();
const page2 = await helper.newPage(browser2, bag.account);
await page2.waitFor(500);
const mailUrl = "https://gmail.com";
await page2.goto(mailUrl, {
waitUntil: "networkidle2"
});
await page2.waitFor(500);

let facebookCode = "";
await page2.waitForSelector("table.aKk > tbody > tr > td.aRz", {
timeout: 2000
});
const mailHeaders = await page2.\$$("table.aKk > tbody > tr > td.aRz");
  for (let i = 0; i < mailHeaders.length; i++) {
    let mailHeader = mailHeaders[i];
    await page2.waitFor(500);
    await mailHeader.click();
  }
  const content = await page2.content();
  const $ = bag.cheerio.load(content);

var mails = $("div.Cp > div > table > tbody > tr");
  const facebookEmailConfirm = "là mã xác nhận Facebook của bạn";
  for (let i = 0; i < mails.length; i++) {
    const mail = mails[i];
    console.log("emailContent = ", mail);
    let emailContent = $(mail).text();
if (emailContent.includes(facebookEmailConfirm)) {
console.log("emailContent = ", emailContent);
facebookCode = emailContent.match(/\d+/g)[0];
facebookCode = facebookCode.trim();
break;
}
}

console.log("facebookCode= ", facebookCode);
bag.result.facebookCode = facebookCode;
page2.close();
};
