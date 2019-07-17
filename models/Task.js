var mongoose = require("mongoose");
var uniqueValidator = require("mongoose-unique-validator");
var TaskSchema = new mongoose.Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId
  },
  name: String,
  accounts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account"
    }
  ],
  chainAction: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ChainAction"
  }
});
mongoose.model("Task", TaskSchema);
