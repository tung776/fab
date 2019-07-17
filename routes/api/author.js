const jwt = require("jsonwebtoken");
var secret = require("../../config").secret;
module.exports = {
  validateToken: (req, res, next) => {
    const authorizationHeaader = req.cookies.faManager;
    let result;
    if (authorizationHeaader) {
      const token = authorizationHeaader.split(" ")[1]; // Bearer <token>
      const options = {
        expiresIn: "2d",
        issuer: "https://soncattuong.com"
      };
      try {
        // verify makes sure that the token hasn't expired and has been issued by us
        result = jwt.verify(token, secret, options);

        // Let's pass back the decoded token to the request object
        req.decoded = result;
        // We call next to pass execution to the subsequent middleware
        next();
      } catch (err) {
        // Throw an error just in case anything goes wrong with verification
        throw new Error(err);
      }
    } else {
      result = {
        error: `Bạn chưa đăng nhập`,
        status: 401
      };
      res.redirect("/api/users/login");
    }
  }
};
