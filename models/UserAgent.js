var mongoose = require("mongoose");
var uniqueValidator = require("mongoose-unique-validator");

var UserAgentSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  agent: String
});

mongoose.model("UserAgent", UserAgentSchema);
