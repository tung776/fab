let ioInstance;

module.exports = function(server) {
  const io = require("socket.io")(server);
  //   io.set("transports", ["websocket"]);

  //   io.use((socket, next) => {
  //     require("./session")(socket.request, {}, next);
  //   });
  // save in higher scope so it can be obtained later
  ioInstance = io;
  return io;
};

// this getIO method is designed for subsequent
// sharing of the io instance with other modules once the module has been initialized
// other modules can do: let io = require("./io.js").getIO();
module.exports.getIO = () => {
  if (!ioInstance) {
    return null;
  }
  return ioInstance;
};
