const jwt = require("jsonwebtoken");
const userModel = require("../models/user.model");
const APIError = require("../utils/errors");

const createToken = async (user, res) => {
  const { _id, firstName } = user;

  const payload = {
    sub: _id,
    firstName: firstName,
  };
  const token = await jwt.sign(payload, process.env.JWT_SECRET_KEY, {
    algorithm: "HS512",
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  return res.status(201).json({
    success: true,
    token,
    message: "Success",
  });
};

const checkToken = async (req, res, next) => {
  const { authorization } = req.headers;
  const headerToken = authorization && authorization.startsWith("Bearer ");

  if (!headerToken) {
    throw new APIError("Invalid session. Please login !", 401);
  }

  const token = authorization.split(" ")[1];

  await jwt.verify(token, process.env.JWT_SECRET_KEY, async (err, decoder) => {
    if (err) {
      throw new APIError("Invalid token !", 401);
    }

    const userInfo = await userModel
      .findById(decoder.sub)
      .select("_id firstName lastName email");
    console.log(userInfo);

    if (!userInfo) {
      throw new APIError("Invalid token !", 401);
    }

    req.user = userInfo;
    next();
  });
};

module.exports = {
  createToken,
  checkToken,
};
