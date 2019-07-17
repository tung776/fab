var fs = require("fs"),
  request = require("request");

module.exports.boDauTiengViet = function(str) {
  str = str.toLowerCase();
  str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
  str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
  str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
  str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
  str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
  str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
  str = str.replace(/đ/g, "d");
  // str = str.replace(/\W+/g, ' ');
  // str = str.replace(/\s/g, '-');
  return str;
};

module.exports.getRandom = arr => {
  var rand = arr[Math.floor(Math.random() * arr.length)];
  return rand;
};
module.exports.randomMin2Max = (min, max) => {
  var rand = Math.random() * (max - min) + min;
  return rand;
};
module.exports.download = async (uri, filename) => {
  request.head(uri, async function(err, res, body) {
    await request(uri).pipe(fs.createWriteStream(filename));
  });
};
