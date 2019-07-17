exports.Status = Object.freeze({
  active: "active",
  checkpoint: "checkpoint",
  inactive: "inactive"
});

exports.typeActions = {
  button: "button",
  custom: "custom",
  url: "url",
  text: "text",
  select: "select",
  close: "close"
};

exports.waitEnum = {
  navigation: "navigation",
  type: "type",
  select: "select",
  other: "other"
};

exports.conditionEnum = [
  {
    name: "for" //for, if, end_for, end_if
  },
  {
    name: "end_for" //for, if, end_for, end_if
  },
  {
    name: "if" //for, if, end_for, end_if
  },
  {
    name: "end_if" //for, if, end_for, end_if
  }
];

// exports.typeActions = {
//   email: "email",
//   passEmail: "passEmail",
//   passFacebook: "passFacebook",
//   passAlibaba: "pasAlibaba",
//   name: "name",
//   username: "username",
//   lastname: "lastname",
//   fullname: "fullname",
//   dateOfBirth: "dateOfBirth",
//   monthOfBirth: "monthOfBirth",
//   yearOfBirth: "yearOfBirth",
//   profile: "profile",
//   button: "button",
//   custom: "custom",
//   url: "url",
//   newPass: "newPass",
//   confirmPass: "confirmPass",
//   select: "select",
//   close: "close"
// };
