// const utils = require("../utils");
exports.randomMin2Max = function(min, max) {
  var rand = Math.random() * (max - min) + min;
  return rand;
};
exports.typeDelayTime = function() {
  const value = this.randomMin2Max(150, 70); //Math.random() * (150 - 70) + 70;
  return value;
};
exports.shortDelayTime = function() {
  const value = this.randomMin2Max(500, 200); //Math.random() * (500 - 200) + 200;
  return value;
};
exports.normalDelayTime = function() {
  const value = this.randomMin2Max(1000, 500); // Math.random() * (1000 - 500) + 300;
  return value;
};
exports.longDelayTime = function() {
  const value = this.randomMin2Max(5000, 3000); //Math.random() * (5000 - 3000) + 3000;
  return value;
};
//1 phút đến 2.5 phút
exports.viewDelay = async function(page) {
  const value = this.randomMin2Max(30, 20); //Math.random() * (30 - 20) + 20;
  const i = 0;
  while (i < value) {
    await page.waitFor(this.longDelayTime());
    i++;
  }
};
//12 đến 37 phút
exports.viewLongDelay = async function(page) {
  const value = this.randomMin2Max(15, 12); //Math.random() * (15 - 12) + 12;
  const i = 0;
  while (i < value) {
    await viewDelay(page);
    i++;
  }
};
exports.type = async function(page, selector, text) {
  debugger;
  await page.waitForSelector(selector);
  await page.waitFor(this.shortDelayTime());
  const delay = this.typeDelayTime();
  // await page.focus(selector);
  var i = 0;
  // while (i < text.length - 1) {
  //   debugger;
  await page.type(selector, text, { delay: delay });
  //   i++;
  // }
};
exports.click = async function(page, selector) {
  await page.waitForSelector(selector);
  await page.waitFor(this.shortDelayTime());
  await page.focus(selector);
  await page.waitFor(this.shortDelayTime());
  await page.click(selector, { delay: this.typeDelayTime() });
};
exports.select = async function(page, selector, value) {
  await page.waitForSelector(selector);
  await page.waitFor(this.shortDelayTime());
  await page.focus(selector);
  await page.waitFor(this.shortDelayTime());
  await page.select(selector, value);
};
