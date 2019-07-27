var _ = require("underscore");
var express = require("express");
var app = express();
var http = require("http").createServer(app),
  path = require("path"),
  methods = require("methods"),
  bodyParser = require("body-parser"),
  session = require("express-session"),
  cors = require("cors"),
  passport = require("passport"),
  errorhandler = require("errorhandler"),
  mongoose = require("mongoose");
var winston = require("./config/winston");
var cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
var secret = require("./config").secret;
const morgan = require("morgan");

var isProduction = process.env.NODE_ENV === "production";
const ProxyChain = require("proxy-chain");
var compression = require("compression");

// Create global app object
app.set("view engine", "ejs");

app.use(cors());
app.use(cookieParser());

// Normal express config defaults
app.use(morgan("combined", { stream: winston.stream }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(require("method-override")());
app.use(express.static(__dirname + "/public"));

app.use(
  session({
    secret: "conduit",
    cookie: { maxAge: 60000 },
    resave: false,
    saveUninitialized: false
  })
);
const dotenv = require("dotenv");
dotenv.config();
if (!isProduction) {
  app.use(errorhandler());
}

if (isProduction) {
  mongoose.connect(process.env.MONGODB_URI);
} else {
  mongoose.connect("mongodb://localhost/facebook");
  mongoose.set("debug", true);
}
mongoose.Promise = global.Promise;
require("./models/User");
require("./config/passport");
require("./models/Proxy");
require("./models/Cookie");
require("./models/UserAgent");
require("./models/Account");
require("./models/Action");
require("./models/ChainAction");
require("./models/Status");
require("./models/Task");
require("./models/Vip");
// mongoose.set("useFindAndModify", false);

app.use(compression());
var userRouter = require("./routes/api/users");
app.use(require("./routes"));
/// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error("Not Found");
  err.status = 404;
  next(err);
});

/// error handlers

// development error handler
// will print stacktrace
// if (!isProduction) {
app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // add this line to include winston logging
  winston.error(
    `${err.status || 500} - ${err.message} - ${req.originalUrl} - ${
      req.method
    } - ${req.ip}`
  );

  // render the error page
  res.status(err.status || 500);
  // res.render("error");
  console.log("hello");
});
// }

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.json({
    errors: {
      message: err.message,
      error: {}
    }
  });
});

// finally, let's start our server...
var server = app.listen(process.env.PORT || 3000, function() {
  console.log("Listening on port " + server.address().port);
});
// var socket = null;
// const io = require("./config/socket")(server);
global.io = require("socket.io")(server);
global.io.on("connection", function(socket) {
  socket.auth = false;
  socket.on("authenticate", function(data) {
    console.log(data);
    //check data được send tới client
    checkAuthToken(data, function(err, success) {
      if (!err && success) {
        console.log("Authenticated socket ", socket.id);
        socket.auth = true;
        _.each(global.io.nsps, function(nsp) {
          if (_.findWhere(nsp.sockets, { id: socket.id })) {
            console.log("restoring socket to", nsp.name);
            nsp.connected[socket.id] = socket;
          }
        });
      }
    });
  });

  setTimeout(function() {
    //sau 1s mà client vẫn chưa dc auth, lúc đấy chúng ta mới disconnect.
    if (!socket.auth) {
      console.log("Disconnecting socket ", socket.id);
      socket.disconnect("unauthorized");
    }
  }, 1000);
});

var checkAuthToken = function(data, cb) {
  let result;
  var tokenData = data.token;
  if (data.token) {
    const token = tokenData.split(" ")[1]; // Bearer <token>
    const options = {
      expiresIn: "2d",
      issuer: "https://soncattuong.com"
    };
    try {
      // verify makes sure that the token hasn't expired and has been issued by us
      result = jwt.verify(token, secret, options);

      // Let's pass back the decoded token to the request object
      // req.decoded = result;
      // We call next to pass execution to the subsequent middleware
      cb(false, true);
    } catch (err) {
      // Throw an error just in case anything goes wrong with verification
      cb(err, false);
    }
  } else {
    var error = `Authentication error. Token required.`;
    cb(error, false);
  }
};

global.forkQueue = require("./system/forkQueue");
global.forkQueue.CreateNew(true);
