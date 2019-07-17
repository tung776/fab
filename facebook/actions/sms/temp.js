const utils = require("../utils");
const UserInfo = {
  name: "",
  lastName: "",
  fullName: "",
  location: "",
  birthDay: "",
  email: "",
  pass: ""
};
let headContent =
  "Tên người dùng,Tên,Họ,Tên hiển thị,Chức vụ,Bộ phận,Số văn phòng,Điện thoại văn phòng,Điện thoại di động,Fax,Địa chỉ,Thành phố,Tiểu bang hoặc tỉnh thành,Mã ZIP hoặc mã bưu điện,Quốc gia hoặc khu vực ";
let content = "";

const getFakeName = async page => {
  const url = "https://www.fakenamegenerator.com/gen-female-vn-hu.php";
  const fullNameTag =
    "#details > div.content > div.info > div > div.address > h3";
  page.goto(url);
  await page.waitForSelector(fullNameTag);
  const fullName = utils.boDauTiengViet(
    await page.$eval(fullNameTag, node => node.innerText)
  );

  const fullNameArr = fullName.split(" ");
  UserInfo.lastName = fullNameArr[fullNameArr.length - 1];
  UserInfo.name = fullNameArr[0];
  UserInfo.fullName = fullName;
  const randomDay = Math.floor(Math.random() * (28 - 1)) + 1;
  const randomMonth = Math.floor(Math.random() * (12 - 1)) + 1;
  const randomYear = Math.floor(Math.random() * (2000 - 1975)) + 1975;
  UserInfo.birthDay = `${randomDay}/${randomMonth}/${randomYear}`;
  const randomNumber = `${Math.floor(Math.random() * 9) + 1}${Math.floor(
    Math.random() * 9
  ) + 1}${Math.random()
    .toString(36)
    .substr(2, 5)}`;
  UserInfo.pass = Math.random()
    .toString(36)
    .substr(2, 12);
  UserInfo.email = `${UserInfo.name}${
    UserInfo.lastName
  }${randomDay}${randomMonth}${randomYear}${randomNumber}@soncattuong.com`;

  console.log("userInfo", UserInfo);
  content = `${content} ${UserInfo.email},${UserInfo.lastName},${
    UserInfo.name
  },${
    UserInfo.fullName
  },Người quản lý CNTT,Công nghệ thông tin,,,,,${randomAddress()},3500, Việt Nam`;

  return UserInfo;
};

const fakeUsers = async (page, count) => {
  let fakeUsers = [];
  for (let index = 0; index < count; index++) {
    const user = await getFakeName(page);
    fakeUsers = [...user];
  }
  console.log(fakeUsers);
  return fakeUsers;
};

const fakeUsersToCSV = async (page, count) => {
  await this.fakeUsers(page, count);
  content = `${headContent} ${content}`;
  console.log(content);
  return content;
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
    "Nguyễn Văn Linh"
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
  return `Số nhà ${streetNumber}, đường ${street}, ${city}, ${city}`;
};

module.exports.getFakeName = getFakeName;
module.exports.fakeUsers = fakeUsers;
module.exports.fakeUsersToCSV = fakeUsersToCSV;
