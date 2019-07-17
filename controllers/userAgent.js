var mongoose = require("mongoose");
var userAgentModel = mongoose.model("UserAgent");
const agentData = require("../facebook/data/userAgent").agents;

exports.index = async (req, res) => {
  let userAgents = [];

  try {
    userAgents = await userAgentModel.find();
    if (userAgents.length == 0) {
      // debugger;
      await agentData.forEach(async item => {
        const userAgent = new userAgentModel({
          _id: new mongoose.Types.ObjectId(),
          agent: item.agent
        });
        await userAgent.save();
      });
      userAgents = await userAgentModel.find();
    }
    return res.render("userAgents/index", { userAgents: userAgents });
  } catch (error) {
    res.status(400).send(error);
  }
};
exports.addUserAgent = async (req, res) => {
  const { agent } = req.body;
  let userAgent = await new userAgentModel({
    _id: new mongoose.Types.ObjectId(),
    agent
  });
  await userAgent.save();
  userAgents = await userAgentModel.find();

  return res.render("userAgents/index", { userAgents: userAgents });
};
exports.deleteUserAgent = async (req, res) => {
  const _id = req.params.id.trim();
  try {
    await userAgentModel.findByIdAndRemove(_id).then(async err => {
      if (err) return res.status(500).send(err);
      const userAgents = await userAgentModel.find();
      return res
        .status(200)
        .render("userAgents/index", { userAgents: userAgents });
    });
  } catch (err) {
    if (err) return res.status(500).send(err);
  }
};
