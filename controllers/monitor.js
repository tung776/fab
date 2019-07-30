var io = require("../config/socket").getIO();
var helper = require("../facebook/actions/helper").helper;
exports.action = async (req, res) => {
  res.render("monitor/action");
};
exports.index = async (req, res) => {
  res.render("monitor/index");
};
exports.sendComment = async (req, res) => {
  try {
    console.log("req.body.data = ", req.body.data);
    let comments = req.body.data.split(";");

    // chi ơi bán cho em cái màu xanh: 092156562;đại ca ơi bán cho em cái màu đỏ sdt:09446465465;chi zai ơi đẹp zai thế; em lấy cái màu xanh sdt:0943431216

    const workers = global.forkQueue.getWorkers();
    console.log("workers.length = ", workers.length);
    var selectWorkers = [];
    var selectedPids = [];
    for (var i = 0; i < comments.length; i++) {
      var worker = null;

      worker = helper.randomFromArray(workers);
      selectWorkers.push({
        worker,
        comment: comments[i]
      });
    }
    console.log("selectWorkers.length = ", selectWorkers.length);

    selectWorkers.forEach(item => {
      if (item.worker.killed || item.worker.connected == false) return;
      console.log("comment: ", item.comment);
      console.log("sending comment");
      item.worker.send({
        isLivetream: true,
        comment: item.comment
      });
    });
  } catch (error) {
    res.status(400).json({
      success: false
    });
  }
};
