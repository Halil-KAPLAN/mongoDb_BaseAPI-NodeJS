const router = require("express").Router();
const { login, register, me } = require("../controllers/auth.controller");
const authValidation = require("../middlewares/validations/auth.validation");
const { checkToken } = require("../middlewares/auth");

router.post("/login", authValidation.login, login);

router.post("/register", authValidation.register, register);

router.get("/me", checkToken, me);

module.exports = router;
