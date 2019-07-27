var mongoose = require("mongoose");
var uniqueValidator = require("mongoose-unique-validator");

var VipSchema = new mongoose.Schema(
  {
    _id: mongoose.Schema.Types.ObjectId,
    facebook: String,
    livetreams: [String],
    posts: [String]
  },
  { timestamps: true }
);

mongoose.model("Vip", VipSchema);
