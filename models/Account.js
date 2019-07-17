var mongoose = require("mongoose");
var uniqueValidator = require("mongoose-unique-validator");
const Status = require("./enum").Status;

var AccountSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  username: {
    type: String,
    lowercase: true,
    required: [true, "can't be blank"]
  },
  email: {
    type: String,
    lowercase: true
  },
  lastName: {
    type: String
  },
  name: {
    type: String
  },
  fullname: {
    type: String
  },
  pass: {
    email: String,
    facebook: String,
    alibaba: String,
    "1688": String,
    other: String
  },
  dateOfBirth: Number,
  monthOfBirth: Number,
  yearOfBirth: Number,
  gender: Number, //2 male 1 female
  facebook: String,
  cookie: [Object],
  proxies: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Proxy"
    }
  ],
  userAgents: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserAgent"
    }
  ],
  status: {
    type: String,
    enum: Object.values(Status),
    default: Status.active
  },
  profile: String,
  friends: [String]
});
exports.properties = () => {
  const arrayOfKeys = Object.keys(mySchema.obj);
  return arrayOfKeys;
};
mongoose.model("Account", AccountSchema);
