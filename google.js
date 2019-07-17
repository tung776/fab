const puppeteer = require("puppeteer");
const loginForm = {
  email: "#email",
  pass: "#pass",
  loginBtn: "#u_0_8"
};
const loginData = {
  email: "trantung@soncattuong.com",
  pass: "Namdinh1"
};

const searchInput =
  "#tsf > div:nth-child(2) > div > div.RNNXgb > div > div.a4bIc > input";

(async () => {
  const browser = await puppeteer.launch({
    headless: false
    // devtools: true
  });
  const page = await browser.newPage();
  await page.goto("https://google.com");
  await page.type(searchInput, "công ty cổ phần kim khí hóa chất cát tường", {
    delay: 50
  });
  //   await page.waitForSelector(5000);
  await page.keyboard.press("Enter");
  //   await page.waitForSelector(
  //     "#rso > div > div > div:nth-child(2) > div > div > div.r > a > h3"
  //   );
  await page.waitForNavigation();
  await page.click(
    "#rso > div > div > div:nth-child(2) > div > div > div.r > a > h3",
    { delay: 50 }
  );
  //   await page.waitForSelector(loginForm.pass);
  //   await page.waitForSelector(loginForm.loginBtn);
  //   await page.type(loginForm.email, loginData.email, { delay: 50 });
  //   await page.type(loginForm.pass, loginData.pass, { delay: 50 });
  //   await page.click(loginForm.loginBtn, { delay: 50 });
  //   await page.screenshot({ path: "example.png" });

  //   await browser.close();
})();
