const userModel = require("../models/user.model");
const bcrypt = require("bcrypt");
const APIError = require("../utils/errors");
const Response = require("../utils/response");
const { createToken } = require("../middlewares/auth");
const crypto = require("crypto");
const sendEmail = require("../utils/sendMail");
const moment = require("moment");

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

const me = async (req, res) => {
  return new Response(req.user).success(res);
};

const forgetPassport = async (req, res) => {
  const { email } = req.body;

  const userInfo = await userModel
    .findOne({ email })
    .select("firstName lastName email");

  if (!userInfo) {
    return new APIError("Invalid user", 400);
  }

  console.log("forgetPassport userInfo: ", userInfo);
  const resetCode = crypto.randomBytes(3).toString("hex");

  await sendEmail({
    from: "base.api.project.16168484@gmail.com",
    to: userInfo.email,
    subject: "Password reset (Base API TEST!)",
    text: `Your password reset code: ${resetCode}`,
  });

  await userModel.updateOne(
    { email },
    {
      reset: {
        code: resetCode,
        time: moment(new Date())
          .add(15, "minute")
          .format("YYYY-MM-DD HH:mm:ss"),
      },
    }
  );

  return new Response(true, "Please check your e-mail !").success(res);
};

module.exports = {
  login,
  register,
  me,
  forgetPassport,
};
