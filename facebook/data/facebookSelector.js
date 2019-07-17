const facebook = {};
facebook.createNew = {
  url: "https://www.facebook.com/r.php",
  lastName: 'input[name="lastname"]',
  firstname: 'input[name="firstname"]',
  email: 'input[name="reg_email__"]',
  confirmEmail: 'input[name="reg_email_confirmation__"]',
  confirmBirthDay:
    'button[type = "submit"].layerConfirm.uiOverlayButton.selected',
  pass: 'input[name="reg_passwd__"]',
  dateOfBirth: 'select[name="birthday_day"]',
  monthOfBirth: 'select[name="birthday_month"]',
  yearOfBirth: 'select[name="birthday_year"]',
  femaleSelect: 'span[data-name="gender_wrapper"] > span > input[value="1"]',
  maleSelect: 'span[data-name="gender_wrapper"] > span > input[value="2"]',
  lastName: 'input[name="lastname"]',
  submit: 'button[name="websubmit"]',
  confirmSubmit: '.uiOverlayFooter > button[type="submit"]',
  code: 'input[name="code"]'
};
module.exports.facebook = facebook;
