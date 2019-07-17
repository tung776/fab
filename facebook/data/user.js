const ProxyChain = require("proxy-chain");
const proxy1 = "http://ntung:844129@p1.vietpn.co:1808";
const LoginInfor = {
  email: "rockfamer@gmail.com",
  pass: "tung1221982",
  ip: async () => {
    return await ProxyChain.anonymizeProxy(proxy1);
  }
};
// const LoginInfor = {
//   email: "trantung@soncattuong.com",
//   pass: "tung1221982"
// };

const LoginForm = {
  email: "#email_container > #email",
  pass: "#pass",
  loginBtn: "#loginbutton"
};

module.exports.LoginForm = LoginForm;
module.exports.LoginInfor = LoginInfor;
