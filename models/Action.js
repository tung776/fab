var mongoose = require("mongoose");
var uniqueValidator = require("mongoose-unique-validator");
var ActionSchema = new mongoose.Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId
  },
  name: String,
  description: String,
  steps: [
    {
      indexStep: {
        type: Number
      },
      // index: {
      //   type: Number
      // },
      next: Number, //bước kế tiếp
      conditionType: {
        //điều kiện thực hiện bước kế tiếp
        name: String, //tên điều kiện
        count: Number, // count = n, n là số lần lặp lại của for, n = -1 thì count sẽ được nhiễm trong core function. Nếu điều kiện là if thì count sẽ không được xét
        next: Number, //bước kế tiếp của điều kiện
        conditionFunction: String
      },
      selector: String, //selector cũng có thể được nhiễm nếu sử dụng cú pháp {{selector}}
      url: String, //url cũng có thể được nhiễm nếu sử dụng cú pháp {{url}}
      actionType: String,
      wait: String,
      description: String,
      documentEval: String,
      customFunction: {
        type: String
      }
      // source: {
      //   modelObject: {
      //     //Ví dụ Account
      //     name: String, //tên trường: lastname, username
      //     property: String // id account
      //   },
      //   documentEval: String,
      //   customFunction: {
      //     type: String
      //   }
      // }
    }
  ]
});
ActionSchema.index(
  {
    "step.customFunction": "hashed"
  },
  { unique: true, background: true, sparse: true }
);
mongoose.model("Action", ActionSchema);
