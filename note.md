###############################################################
customize fontawsome https://icomoon.io/
###############################################################
Cách sửa lỗi WiredTigerIndex::insert: key too large to index:

mở cmd lên và gõ lên mongo
câu lệnh này sẽ kết nối với cơ sở dữ liệu mongo

### 2.

gõ lệnh
show dbs
sẽ hiện các cơ sở dữ liệu
gõ tiếp
use facebook (cơ sở dữ liệu facebook)
show collections
sẽ hiện thỉ các bảng dữ liệu
db.actions.getIndexes()
sẽ hiện các index của bảng actions
xóa các index không cần thiết
db.actions.dropIndex("tên_index")
và tạo index mới bằng lệnh
db.actions.createIndex({ "step.customFuction": "text" })

#################################################################

module.exports = async function() {
const browser2 = bag.page.browser();
const page2 = browser2.newPage();
const mailUrl = "http://outlook.office.com/owa/?path=/mail/inbox";
await page2.goto("http://outlook.office.com/owa/?path=/mail/inbox", {
waitUntil: "networkidle2"
});
await page2.waitFor(500);
const content = await page2.content();
const passSelector = 'input[name="passwd"][type="password"]';
const emailSelector = 'input[name="loginfmt"][type="email"]';
const nextSelector = 'input[type="submit"]';
const emailInput = findElements(content, passSelector);
if (emailInput && emailInput.length > 0) {
await page2.type(emailSelector, bag.account.email, { delay: 100 });
await page2.waitFor(300);
await page2.waitForSelector(nextSelector);
await page2.click(nextSelector, { delay: 100 });
await page2.waitForNavigation();
await page2.waitFor(300);
await page2.type(passSelector, bag.account.pass.email, { delay: 100 });
await page2.waitFor(300);
await page2.waitForSelector(nextSelector);
await page2.click(nextSelector, { delay: 100 });
await page2.waitFor(300);
await page2.waitForSelector(nextSelector);
await page2.click(nextSelector, { delay: 100 });
await page2.waitForNavigation();
await page2.waitFor(300);
await page2.goto(mailUrl);
}
let facebookCode = "";
facebookCode = await getCode(content);
const otherMail = "#\_ariaId_25";
if (facebookCode == "") {
await page2.waitForSelector(otherMail);
await page2.waitFor(300);
await page2.click(otherMail, { delay: 100 });
await page2.waitForSelector(headerEmail);
await page2.waitFor(300);
await page2.waitFor(300);
facebookCode = await getCode(content);
}
};
function getCode(content) {
let facebookCode = "";
const facebookEmailConfirm = "là mã xác nhận Facebook của bạn";
const headerEmail = "span.lvHighlightAllClass.lvHighlightSubjectClass";
const $ = bag.cheerio.load(content);
  let emails = findElements(content, headerEmail);
  for (let i = 0; i < emails.length; i++) {
    let emailContent = $(emails[i]).text();
if (emailContent.includes(facebookEmailConfirm)) {
facebookCode = emailContent.replace(facebookEmailConfirm, "");
facebookCode = facebookCode.trim();
break;
}
}
}
function findElements(content, selector) {
const $ = bag.cheerio.load(content);
  const els = $(selector);
return els;
}
