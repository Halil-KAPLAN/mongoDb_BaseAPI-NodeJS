const userModel = require("../models/user.model");
const bcrypt = require("bcrypt");
const APIError = require("../utils/errors");
const Response = require("../utils/response");
const {
  createToken,
  createTemporaryToken,
  decodedTemporaryToken,
} = require("../middlewares/auth");
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
  console.log("userInfo ",userInfo);

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
    .select("firstName lastName email reset");

  if (!userInfo) {
    return new APIError("Invalid user", 400);
  }

  console.log("forgetPassport userInfo: ", userInfo);
  const resetCode = crypto.randomBytes(3).toString("hex");
  console.log("resetCode ",resetCode);

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

const resetCodeCheck = async (req, res) => {
  const { email, code } = req.body;

  const userInfo = await userModel
    .findOne({ email })
    .select("_id firstName lastName email reset");
  if (!userInfo) {
    throw new APIError("Invalid code !", 401);
  }
  const dbTime = moment(userInfo.reset.time);
  const nowTime = moment(new Date());

  const timeDiff = dbTime.diff(nowTime, "minutes");

  console.log("userInfo",userInfo);
  console.log("time diff: ", timeDiff);

  if (timeDiff <= 0 || userInfo.reset.code !== code) {
    throw new APIError("Invalid code !", 401);
  }

  const temporaryToken = await createTemporaryToken(
    userInfo._id,
    userInfo.email
  );

  return new Response({ temporaryToken }, "Password can be reset").success(res);
};

const resetPassword = async (req, res) => {
  const { password, temporaryToken } = req.body;


  const decodeToken = await decodedTemporaryToken(temporaryToken);
  console.log("decodeToken: ", decodeToken);

  if (!decodeToken) {
    throw new APIError("Invalid token !", 401);
  }

  const hashPassword = await bcrypt.hash(password, 10);

  await userModel.findByIdAndUpdate(
    { _id: decodeToken._id },
    {
      reset: {
        code: null,
        time: null,
      },
      password: hashPassword,
    }
  );

  return new Response(decodeToken, "Password reset successful").success(res);
};

module.exports = {
  login,
  register,
  me,
  forgetPassport,
  resetCodeCheck,
  resetPassword,
};
