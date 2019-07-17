const profile_link = 'div[data-click="profile_icon"]';
const view_all_hint_friends = 'a[href="/friends/center/?fb_ref=tl"]';
const view_invited_friends = 'a.jewelButton[name = "requests"]';
const accept_invited_friend =
  'form[action="/ajax/reqs.php"]>div.actions>button[type="submit"]';
const profile = {
  goHomePage: async (baseURL, page, email) => {
    try {
      await page.waitFor(500);
      await page.waitForSelector(profile_link, { visible: true });
      await page.click(profile_link);
      if (!page.url().includes("https://www.facebook.com/profile.php")) {
        await page.screenshot({ path: `${email}.png` });
        console.log("đã có lỗi");
        return {
          isSuccess: false,
          message: "Đã có lỗi"
        };
      }
      await page.waitForNavigation();
    } catch (ex) {
      await page.screenshot({ path: `${email}.png` });
      return {
        isSuccess: false,
        message: "Đã có lỗi"
      };
    }
  },
  acceptInvitedFriends: async page => {
    if (!page.url().includes("https://www.facebook.com/profile.php")) {
      console.log("chưa đăng nhập chăng ?");
    }
    try {
      await page.waitFor(500);
      await page.waitForSelector(view_invited_friends);
      await page.click(view_invited_friends, { delay: 100 });
      await page.waitFor(1000);
      await page.waitForSelector("a.findFriendsLink");
      await page.waitForSelector(accept_invited_friend);
      const btn_invited_friends = await page.$$(accept_invited_friend);
      console.log(btn_invited_friends.length);
      if (btn_invited_friends.length < 1) {
        console.log("Chưa có danh sách");
        return;
      }
      const max = btn_invited_friends.length;
      const min =
        btn_invited_friends.length - 10 > 0
          ? btn_invited_friends.length - 10
          : 0;
      const random = Math.random() * (max - min) + min;
      for (var i = 0; i <= random; i++) {
        await page.waitFor(Math.random() * (500 - 400) + 400);
        await btn_invited_friends[i].click();
      }
      await page.waitFor(200);
      await page.click(view_invited_friends, { delay: 100 });
    } catch (ex) {
      console.log("đã có lỗi");
    }
  }
};

module.exports.profile = profile;
