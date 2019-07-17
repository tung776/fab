var mongoose = require("mongoose");
var uniqueValidator = require("mongoose-unique-validator");

var StatusSchema = new mongoose.Schema(
  {
    _id: mongoose.Schema.Types.ObjectId,
    status: {
      type: String,
      lowercase: true,
      required: [true, "can't be blank"]
    }
  },
  { timestamps: true }
);

mongoose.model("Status", StatusSchema);
