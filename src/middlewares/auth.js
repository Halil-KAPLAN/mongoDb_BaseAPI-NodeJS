const jwt = require("jsonwebtoken");

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

module.exports = {
  createToken,
};
