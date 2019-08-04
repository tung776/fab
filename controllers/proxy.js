var mongoose = require("mongoose");
var proxyModel = mongoose.model("Proxy");
const proxiesData = require("../facebook/data/ip").ips;

exports.index = async (req, res) => {
  let proxies = [];
  try {
    proxies = await proxyModel.find();
    if (proxies.length == 0) {
      await proxiesData.forEach(async item => {
        const proxy = new proxyModel({
          _id: new mongoose.Types.ObjectId(),
          ip: item.ip,
          pass: item.pass,
          port: item.port,
          user: item.userName,
          location: item.location,
          status: "active"
        });
        await proxy.save();
      });
      proxies = await proxyModel.find();
    }
    return res.render("proxies/index", { proxies: proxies });
  } catch (error) {
    res.status(400).send(error);
  }
};
exports.addProxy = async (req, res) => {
  const { ip, pass, port, user, location } = req.body;
  let proxy = await new proxyModel({
    _id: new mongoose.Types.ObjectId(),
    ip,
    pass,
    port,
    user,
    location,
    status: "active"
  });
  await proxy.save();
  proxies = await proxyModel.find();

  return res.render("proxies/index", { proxies: proxies });
};
exports.saveProxy = async (req, res) => {
  const { _id, ip, pass, port, user, location } = req.body;
  let proxy = await proxyModel.findByIdAndUpdate(
    {
      _id
    },
    { _id, ip, pass, port, user, location }
  );
  await proxy.save();
  proxies = await proxyModel.find();

  return res.render("proxies/index", { proxies: proxies });
};
exports.deleteProxy = async (req, res) => {
  const _id = req.params.id.trim();
  try {
    await proxyModel.findByIdAndRemove(_id).then(async err => {
      if (err) return res.status(500).send(err);
      const proxies = await proxyModel.find();

      return res.status(200).render("proxies/index", { proxies: proxies });
    });
  } catch (err) {
    if (err) return res.status(500).send(err);
  }
};
