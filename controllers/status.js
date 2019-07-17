var mongoose = require("mongoose");
var statusModel = mongoose.model("Status");

exports.index = async (req, res) => {
  let statuses = [];
  try {
    statuses = await statusModel.find();

    return res.render("status/index", { statuses: statuses });
  } catch (error) {
    res.status(400).send(error);
  }
};
exports.deleteStatus = async (req, res) => {
  const _id = req.params.id.trim();
  try {
    await statusModel.findByIdAndRemove(_id);
    return res.status(200).json({ success: true });
  } catch (err) {
    if (err) return res.status(500).send(err);
  }
};
