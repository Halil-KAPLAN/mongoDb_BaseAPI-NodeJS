const router = require("express").Router();
const {
  login,
  register,
  me,
  forgetPassport,
} = require("../controllers/auth.controller");
const authValidation = require("../middlewares/validations/auth.validation");
const { checkToken } = require("../middlewares/auth");

router.post("/login", authValidation.login, login);

router.post("/register", authValidation.register, register);

router.get("/me", checkToken, me);

router.post("/forget-password", forgetPassport);

module.exports = router;
