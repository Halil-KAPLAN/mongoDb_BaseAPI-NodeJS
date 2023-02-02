const userModel = require("../models/user.model");
const bcrypt = require("bcrypt");
const APIError = require("../utils/errors");
const Response = require("../utils/response");
const { createToken } = require("../middlewares/auth");

const login = async (req, res) => {
  const { email, password } = req.body;

  const userInfo = await userModel.findOne({ email });
  if (!userInfo) {
    throw new APIError("Username or Password is wrong.", 401);
  }

  const comparePasspowrd = await bcrypt.compare(password, userInfo.password);
  if (!comparePasspowrd) {
    throw new APIError("Username or Password is wrong.", 401);
  }

  createToken(userInfo, res);
};

const register = async (req, res) => {
  const { email } = req.body;

  const userCheck = await userModel.findOne({ email });
  if (userCheck) {
    throw new APIError("This email is in use.", 401);
  }

  req.body.password = await bcrypt.hash(req.body.password, 10);
  console.log("hash password", req.body.password);

  const newUser = new userModel(req.body);
  await newUser
    .save()
    .then((data) => {
      return new Response(data, "Registration successfully created.").created(
        res
      );
    })
    .catch((err) => {
      throw new APIError("User failed to register !", 400);
    });
};

module.exports = {
  login,
  register,
};
