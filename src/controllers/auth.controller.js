const userModel = require("../models/user.model");
const bcrypt = require("bcrypt");
const APIError = require("../utils/errors");
const Response = require("../utils/response");

const login = async (req, res) => {
  console.log(req.body);

  return res.json(req.body);
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
