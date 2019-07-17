const outlook = {};
outlook.outlookLogin = {
  url: "https://login.microsoftonline.com",
  otherAccount: "#otherTile",
  email: 'input[name="loginfmt"][type="email"]',
  next: 'input[type="submit"]',
  pass: 'input[name="passwd"][type="password"]',
  noBtn: "#idBtn_Back",
  goOutlookBtn: "#ShellMail_link",
  mailUrl: "https://outlook.office365.com/owa/?path=/mail/inbox",
  otherMail: "#_ariaId_25",
  // headerEmail: "span.lvHighlightAllClass.lvHighlightFromClass",
  headerEmail: "span.lvHighlightAllClass.lvHighlightSubjectClass",
  facebookEmailConfirm: "là mã xác nhận Facebook của bạn"
};
module.exports.outlook = outlook;
