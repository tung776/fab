var mongoose = require("mongoose");
var uniqueValidator = require("mongoose-unique-validator");

var CookieSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  cookie: String
});

mongoose.model("Cookie", CookieSchema);
