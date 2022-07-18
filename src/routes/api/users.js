const express = require("express");
const authorize = require("../../middlewares/authorize");
const {
  catchRegErrors,
  catchLogErrors,
  catchErrors,
  catchVerifyErrors,
} = require("../../middlewares/catch-errors");
const {
  postSignupValidation,
  postLoginValidation,
} = require("../../middlewares/validationSchema");
const router = express.Router();
const {
  signinUserController,
  logoutUserController,
  signupUserController,
  getCurrentUserController,
  getVerifyController,
  getVerifyTokenController,
  refreshTokenController,
  getContacts,
  addContact,
  updateContact,
  deleteContact,
  getUsers,
  deleteUser,
  getUserInfo,
} = require("../../controllers/users");

router.post(
  "/signup",
  postSignupValidation,
  catchRegErrors(signupUserController)
);

router.post(
  "/login",
  postLoginValidation,
  catchLogErrors(signinUserController)
);

router.get("/logout", authorize, catchErrors(logoutUserController));

router.get("/current", authorize, catchErrors(getCurrentUserController));

router.get("/verify/:verificationToken", catchErrors(getVerifyTokenController));

router.post("/verify/", catchVerifyErrors(getVerifyController));

router.get("/refresh", authorize, catchErrors(refreshTokenController));

router.post("/contacts", catchErrors(getContacts));

router.get("/", catchErrors(getUsers));

router.get("/info", catchErrors(getUserInfo));

router.delete("/:userId", catchErrors(deleteUser));

router.post("/contacts/add", catchErrors(addContact));

router.put("/:contactId", catchErrors(updateContact));

router.post("/contacts/contactId", catchErrors(deleteContact));

module.exports = router;
