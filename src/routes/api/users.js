const express = require("express");
const authorize = require("../../middlewares/authorize");
const {
  catchRegErrors,
  catchLogErrors,
  catchErrors,
  catchVerifyErrors,
} = require("../../middlewares/catch-errors");
const { postAuthValidation } = require("../../middlewares/validationSchema");
const router = express.Router();

const multer = require("multer");
const mime = require("mime-types");
const uuid = require("uuid");
const {
  signinUserController,
  logoutUserController,
  signupUserController,
  getCurrentUserController,
  getVerifyController,
  getVerifyTokenController,
} = require("../../controllers/users");

const upload = multer({
  storage: multer.diskStorage({
    filename: (req, file, cb) => {
      const extname = mime.extension(file.mimetype);
      const filename = uuid.v4() + "." + extname;
      cb(null, filename);
    },
    destination: "./tmp",
  }),
});

router.post(
  "/signup",
  postAuthValidation,
  catchRegErrors(signupUserController)
);

router.post("/login", postAuthValidation, catchLogErrors(signinUserController));

router.get("/logout", authorize, catchErrors(logoutUserController));

router.get("/current", authorize, catchErrors(getCurrentUserController));

router.get("/verify/:verificationToken", catchErrors(getVerifyTokenController));

router.post("/verify/", catchVerifyErrors(getVerifyController));

module.exports = router;
