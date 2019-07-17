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
  const mailHeaders = await page2.$$("table.aKk > tbody > tr > td.aRz");
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
      facebookCode = emailContent.replace(facebookEmailConfirm, "");
      facebookCode = facebookCode.trim();
      break;
    }
  }

  bag.result.facebookCode = facebookCode;
  page2.close();
};

module.exports = async function() {
  const page = bag.page;
  const addFriends = await page.$$("button.FriendRequestAdd.addButton");
  let maxFriends = 20;
  if (maxFriends > addFriends.length) {
    maxFriends = addFriends.length;
  }
  console.log("friendRequestAdd addFriends = ", addFriends.length);
  for (var i = 0; i < maxFriends; i++) {
    if (addFriends[i] != undefined) {
      if (bag.helper.isVisible(addFriends[i], page)) {
        await page.waitFor(200);
        await addFriends[i].focus();
        await page.waitFor(200);
        await addFriends[i].click();
      }
    }
  }
};

module.exports = async function() {
  const page = bag.page;
  const addFriends = await page.$$(".ego_action > a");
  for (var i = 0; i < addFriends.length; i++) {
    if (addFriends[i] != undefined) {
      if (bag.helper.isVisible(addFriends[i], page)) {
        await page.waitFor(200);
        await addFriends[i].focus();
        await page.waitFor(200);
        await addFriends[i].click();
      }
    }
  }
};

module.exports = async function() {
  try {
    const page = bag.page;
    const likes = await page.$$('a[data-testid="UFI2ReactionLink"]');
    let maxlikes = 20;
    if (maxlikes > likes.length) {
      maxlikes = likes.length;
    }
    for (var i = 0; i < maxlikes; i++) {
      if (likes[i] != undefined) {
        if (bag.helper.isVisible(likes[i], page)) {
          await page.waitFor(200);
          await likes[i].focus();
          await page.waitFor(200);
          await likes[i].click();
        }
      }
    }
  } catch (error) {
    throw
  }
  
};

module.exports = async function() {
  try {
    const page = bag.page;
    const addFriends = await page.$$("button.FriendRequestAdd.addButton");
    let maxFriends = 20;
    if (maxFriends > addFriends.length) {
      maxFriends = addFriends.length;
    }
    for (var i = 0; i < maxFriends; i++) {
      if (addFriends[i] != undefined) {
        if (bag.helper.isVisible(addFriends[i], page)) {
          await page.waitFor(200);      
          await addFriends[i].focus();
          await page.waitFor(200);      
          await addFriends[i].click();
        }
          
      }
    }
  }
  catch(error){}
};

module.exports = async function() {
  try {
    const page = bag.page;
  const likes = await page.$$('a[data-testid="UFI2ReactionLink"]');
  let maxlikes = 20;
  if (maxlikes > likes.length) {
    maxlikes = likes.length;
  }
  for (var i = 0; i < maxlikes; i++) {
    if (likes[i] != undefined) {
      if (bag.helper.isVisible(likes[i], page)) {
        await page.waitFor(200);
        await likes[i].focus();
        await page.waitFor(200);
        await likes[i].click();
      }
    }
  }
  } catch(error) {}
};
