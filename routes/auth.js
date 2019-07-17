// var jwt = require("express-jwt");
const jwt = require("jsonwebtoken");
var secret = require("../config").secret;
const passportJWT = require("passport-jwt");
const ExtractJWT = passportJWT.ExtractJwt;

function getTokenFromHeader(req) {
  if (
    (req.headers.authorization &&
      req.headers.authorization.split(" ")[0] === "Token") ||
    (req.headers.authorization &&
      req.headers.authorization.split(" ")[0] === "Bearer")
  ) {
    return req.headers.authorization.split(" ")[1];
  }

  return null;
}

// var auth = {
//   required: jwt({
//     secret: secret,
//     userProperty: "payload",
//     getToken: ExtractJWT.fromAuthHeaderAsBearerToken()
//   }),
//   optional: jwt({
//     secret: secret,
//     userProperty: "payload",
//     credentialsRequired: false,
//     getToken: ExtractJWT.fromAuthHeaderAsBearerToken()
//   })
// };

module.exports = auth;
