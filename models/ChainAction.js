var mongoose = require("mongoose");
var uniqueValidator = require("mongoose-unique-validator");
var ChainActionSchema = new mongoose.Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId
  },
  name: String,
  description: String,
  customFunction: String,
  actions: [
    {
      action: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Action"
      },
      pageForAction: String
    }
  ]
});

mongoose.model("ChainAction", ChainActionSchema);
