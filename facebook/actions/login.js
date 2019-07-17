const user = require("../data/user.js");

const login = async (baseURL, page, email, pass) => {
  try {
    await page.goto(`${baseURL}/login`);
    //   await page.waitForNavigation();
    //   await page.waitFor(Math.floor(Math.random() * 11) * 500);
    //   await page.waitForSelector(
    //     'a[href="https://www.facebook.com/recover/initiate?lwv=111&ars=royal_blue_bar"]'
    //   );
    //   await page.waitFor(3000);
    //   await page.waitForSelector('span.signup_box_content > a[role="button"]', {
    //     visible: true
    //   });
    await page.waitForSelector(user.LoginForm.pass, { visible: true });
    await page.waitForSelector(user.LoginForm.email, { visible: true });
    //   await page.waitForSelector(user.LoginForm.loginBtn, { visible: true });

    await page.type(user.LoginForm.pass, pass, {
      delay: 50
    });

    await page.type(user.LoginForm.email, email, {
      delay: 50
    });

    await page.click(user.LoginForm.loginBtn);
    console.log("current url = ", page.url());
    if (page.url().includes("https://www.facebook.com/?sk=welcome")) {
      await page.screenshot({ path: `${email}.png` });
      return {
        isSuccess: false,
        message: "Lỗi đăng nhập"
      };
    }
    return {
      isSuccess: false,
      url: page.url()
    };
  } catch (ex) {
    await page.screenshot({ path: `${email}.png` });
    return {
      isSuccess: false,
      message: ex
    };
  }
};
module.exports = login;
