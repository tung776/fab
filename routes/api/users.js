var mongoose = require("mongoose");
var router = require("express").Router();
var passport = require("passport");
var User = mongoose.model("User");
var userController = require("../../controllers/user");
// var auth = require("../auth");
const multer = require("multer");
const jwt = require("jsonwebtoken");
var secret = require("../../config").secret;
const validateToken = require("./author").validateToken;

var profileStore = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, "public/users/pictures");
  },
  filename: function(req, file, cb) {
    // debugger;
    cb(null, file.originalname);
  }
});
var profileUpload = multer({ storage: profileStore });
router.post(
  "/users/uploadfile",
  profileUpload.single("profile"),
  userController.profileUpload
);

router.get("/user", validateToken, function(req, res, next) {
  const payload = req.decoded;
  User.findById(payload.id)
    .then(function(user) {
      if (!user) {
        return res.sendStatus(401);
      }
      const payload = {
        id: user._id,
        email: user.email
      };
      const options = {
        expiresIn: "2d",
        issuer: "https://soncattuong.com"
      };
      jwt.sign(payload, secret, options, (err, token) => {
        if (err)
          res.status(500).json({ error: "Error signing token", raw: err });
        const tokenData = `Bearer ${token}`;
        res.cookie("faManager", tokenData);
        res.json({
          success: true,
          user: user,
          token: tokenData
        });
      });
    })
    .catch(next);
});

router.put("/user", validateToken, function(req, res, next) {
  const payload = req.decoded;
  User.findById(payload.id)
    .then(function(user) {
      if (!user) {
        return res.sendStatus(401);
      }

      // only update fields that were actually passed...
      if (typeof req.body.user.username !== "undefined") {
        user.username = req.body.user.username;
      }
      if (typeof req.body.user.email !== "undefined") {
        user.email = req.body.user.email;
      }
      if (typeof req.body.user.bio !== "undefined") {
        user.bio = req.body.user.bio;
      }
      if (typeof req.body.user.image !== "undefined") {
        user.image = req.body.user.image;
      }
      if (typeof req.body.user.password !== "undefined") {
        user.setPassword(req.body.user.password);
      }

      return user.save().then(function() {
        return res.json({ user: user.toAuthJSON() });
      });
    })
    .catch(next);
});

router.post("/users/login", function(req, res, next) {
  if (!req.body.user.email) {
    return res.status(422).json({ errors: { email: "không được bỏ trống" } });
  }

  if (!req.body.user.password) {
    return res
      .status(422)
      .json({ errors: { password: "không được bỏ trống" } });
  }

  passport.authenticate("local", { session: false }, function(err, user, info) {
    if (err) {
      return next(err);
    }

    if (user) {
      const payload = {
        id: user._id,
        email: user.email
      };
      const options = {
        expiresIn: "2d",
        issuer: "https://soncattuong.com"
      };
      jwt.sign(payload, secret, options, (err, token) => {
        if (err)
          res.status(500).json({ error: "Error signing token", raw: err });
        const tokenData = `Bearer ${token}`;
        res.cookie("faManager", tokenData);
        res.json({
          email: user.email,
          success: true,
          token: tokenData
        });
      });

      // user.token = user.generateJWT();

      // return res.json({ user: user.toAuthJSON() });
    } else {
      return res.status(422).json(info);
    }
  })(req, res, next);
});

router.get("/users/login", function(req, res) {
  res.render("users/login");
});
router.get("/users/logout", function(req, res) {
  res.clearCookie("faManager");
});
router.get("/users/create", function(req, res) {
  res.render("users/create");
});

router.post("/users/create", async function(req, res, next) {
  const users = await User.find();
  if (users.length > 0) {
    validateToken(req, res, next);
    if (req.decoded == undefined)
      return res.status(401).send("Bạn chưa đăng nhập");
    User.findById(req.decoded.id).then(function(user) {
      if (!user) {
        return res.sendStatus(401);
      }
    });
  }
  var user = new User({
    ...req.body.user
  });
  user.setPassword(req.body.user.password);

  user
    .save()
    .then(function() {
      return res.json({ user: user.toAuthJSON() });
    })
    .catch();
});

module.exports = router;
