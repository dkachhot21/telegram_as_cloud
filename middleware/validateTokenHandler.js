const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const { constants } = require("../constants");

const validateToken = asyncHandler(async (req, res, next) => {
  let token;
  let authHeader =
    req.headers.authorization ||
    req.headers.AUTHORIZATION ||
    req.headers.Authorization;
  if (authHeader && authHeader.startsWith("Bearer")) {
    token = authHeader.split(" ")[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_KEY, (err, decoded) => {
      if (err) {
        res.status(constants.UNAUTHORIZED);
        throw new Error("User is not Authorized");
      }
      req.user = decoded.user;
      next();
    });

    if (!token) {
      res.status(constants.UNAUTHORIZED);
      throw new Error("User is unauthorized or token missing");
    }
  }
});

module.exports = validateToken;
