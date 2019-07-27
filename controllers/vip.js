var os = require("os");
var mongoose = require("mongoose");
var vipModel = mongoose.model("Vip");

var fs = require("fs-extra");
var appPath = require("../appPath").originPath;
var path = require("path");
var helper = require("../facebook/actions/helper").helper;

exports.index = async (req, res) => {
  try {
    let vips = [];
    vips = await vipModel.find();
    return res.render("vip/index", {
      vips: vips
    });
  } catch (error) {
    console.log(error);
  }
};
exports.update = async (req, res) => {
  try {
    const data = req.body;
    const vip = await vipModel.findByIdAndUpdate(
      {
        _id: data.id
      },
      data
    );
    vips = await vipModel.find();
    return res.render("vip/index", {
      vips: vips
    });
  } catch (error) {
    res.status(400).json({
      success: false
    });
  }
};
exports.newVip = async (req, res) => {
  try {
    const data = req.body;
    const vip = new vipModel({
      _id: new mongoose.Types.ObjectId(),
      ...data
    });
    await vip.save();
    vips = await vipModel.find();
    return res.render("chainAction/index", {
      vips: vips
    });
  } catch (error) {
    res.status(400).json({
      success: false
    });
  }
};
exports.new = async (req, res) => {
  return res.render("vip/add");
};
exports.remove = async (req, res) => {
  try {
    const id = req.params.id;
    const result = await vipModel.findByIdAndDelete(id);
    res.status(200).json({
      isSuccess: true,
      error: null
    });
  } catch (error) {
    res.status(400).json({
      isSuccess: false,
      error: null
    });
  }
};
exports.detail = async (req, res) => {
  try {
    const id = req.params.id;
    const vip = await vipModel.findById({
      _id: id
    });
    return res.render("vip/update", {
      vip: vip
    });
  } catch (error) {
    return res.status(400).json({
      message: "không tìm thấy dữ liệu"
    });
  }
};
