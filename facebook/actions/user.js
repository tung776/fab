/*
https://namefake.com/vietnamese-vietnam/female/51746149f03e2d50e5461ee10363c044
https://www.fantasynamegenerators.com/vietnamese_names.php
*/
var mongoose = require("mongoose");
const utils = require("../utils");
const fs = require("fs");
const ips = require("../data/ip");
const agents = require("../data/userAgent");
var accountModel = mongoose.model("Account");
var userAgentModel = mongoose.model("UserAgent");
var proxyModel = mongoose.model("Proxy");

let headContent =
  "Tên người dùng,Tên,Họ,Tên hiển thị,Chức vụ,Bộ phận,Số văn phòng,Điện thoại văn phòng,Điện thoại di động,Fax,Địa chỉ,Thành phố,Tiểu bang hoặc tỉnh thành,Mã ZIP hoặc mã bưu điện,Quốc gia hoặc khu vực ";
let content = "";
let UserInfoList = [];
let index = 0;
const url = "https://www.fantasynamegenerators.com/vietnamese_names.php";

const getFakeName = async page => {
  const proxiesData = await proxyModel.find();
  const userAgentsData = await userAgentModel.find();
  const fullnameTag = "#result";
  await page.goto(url);
  await page.waitForSelector(fullnameTag);
  const fullnames = utils.boDauTiengViet(
    await page.$eval(fullnameTag, node => node.innerText)
  );

  const fullnameArr = fullnames.split("\n");
  fullnameArr.forEach(item => {
    if (item != " " && item != "") {
      const fullname = item;
      const arrName = item.split(" ");
      const UserInfo = {};
      UserInfo.lastName = arrName[arrName.length - 1];
      UserInfo.name = arrName[0];
      UserInfo.fullname = fullname;
      const randomDay = Math.floor(Math.random() * (28 - 1)) + 1;
      const randomMonth = Math.floor(Math.random() * (12 - 1)) + 1;
      const randomYear = Math.floor(Math.random() * (2000 - 1975)) + 1975;
      UserInfo.birthDay = `${randomDay}/${randomMonth}/${randomYear}`;
      const randomNumber = `${Math.floor(Math.random() * 9) + 1}${Math.floor(
        Math.random() * 9
      ) + 1}${Math.random()
        .toString(36)
        .substr(2, 2)}`;
      UserInfo.dateOfBirth = randomDay;
      UserInfo.monthOfBirth = randomMonth;
      UserInfo.yearOfBirth = randomYear;
      const pass = Math.random()
        .toString(36)
        .substr(2, 12);
      UserInfo.pass = {};
      UserInfo.pass.alibaba = pass;
      UserInfo.pass.facebook = pass;
      UserInfo.pass.email = pass;
      UserInfo.pass["1688"] = pass;
      UserInfo.username = `${UserInfo.name}${UserInfo.lastName}${randomNumber}`;
      UserInfo.email = `${UserInfo.username}@soncattuong.com`;
      UserInfo.proxies = utils.getRandom(proxiesData);
      UserInfo.userAgents = utils.getRandom(userAgentsData);
      UserInfo.status = "inactive";
      UserInfo.gender = "1";
      UserInfoList.push(UserInfo);
      // debugger;
      index++;

      content = `${content}\n${UserInfo.email},${UserInfo.lastName},${
        UserInfo.name
      },${
        UserInfo.fullname
      },Sinh Viên,Công nghệ thông tin,,,,,${randomAddress()},3500,Việt Nam`;
    }
  });
};

const fakeUsers = async (page, count) => {
  let fakeUsers = [];
  for (let index = 0; index < count; index++) {
    const user = await getFakeName(page);
  }
  // console.log(fakeUsers);
  // console.log(UserInfoList);
  // console.log(UserInfoList);
  return UserInfoList;
};

const fakeUsersToCSV = async (page, count, path) => {
  const fakeUsers = await this.fakeUsers(page, count);
  content = `${headContent} ${content}`;
  // console.log(fakeUsers);
  try {
    await fs.writeFile(`${path}/userInfor.csv`, content, function(err) {
      // debugger;
      if (err) {
        return console.log(err);
      }

      console.log("The file was saved!");
    });
  } catch (error) {}
  return fakeUsers;
};

randomAddress = () => {
  let streets = [
    "Giải phóng",
    "Quang Trung",
    "Bà Triệu",
    "Điện Biên",
    "Hàng Tiện",
    "Hàng Đồng",
    "Nguyễn Văn Đồng",
    "Nguyễn Văn Linh",
    "Bùi Thị Xuân",
    "Cao Bá Quát",
    "Chu Mạnh Trinh",
    "Đinh Công Tráng",
    "Hải Triều",
    "Hàn Thuyên",
    "Hai Bà Trưng"
  ];
  let street = streets[Math.floor(Math.random() * streets.length)];
  let cities = [
    "Hà Nội",
    "Hà Nam",
    "Hà Tây",
    "Nam Định",
    "Bắc Ninh",
    "Hải Phòng",
    "Hải Dương"
  ];
  let city = cities[Math.floor(Math.random() * cities.length)];

  const streetNumber = Math.floor(Math.random() * (1000 - 1)) + 1;
  return `Số nhà ${streetNumber} đường ${street},${city},${city}`;
};

module.exports.getFakeName = getFakeName;
module.exports.fakeUsers = fakeUsers;
module.exports.fakeUsersToCSV = fakeUsersToCSV;
