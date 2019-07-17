var mongoose = require("mongoose");
var uniqueValidator = require("mongoose-unique-validator");

var ProxySchema = new mongoose.Schema(
  {
    _id: mongoose.Schema.Types.ObjectId,
    ip: {
      type: String,
      lowercase: true,
      required: [true, "can't be blank"]
    },
    port: {
      type: String,
      lowercase: true,
      required: [true, "can't be blank"],
      match: [/^[0-9]+$/, "is invalid"]
    },
    user: String,
    pass: String,
    status: String
  },
  { timestamps: true }
);

mongoose.model("Proxy", ProxySchema);
