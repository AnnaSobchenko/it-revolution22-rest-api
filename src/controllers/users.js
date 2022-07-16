const {
  signupUser,
  loginUser,
  currentUser,
  logoutUser,
  verificationUser,
  verificationSecondUser,
  refreshMToken,
} = require("../services/users");

const signinUserController = async (req, res, next) => {
  const { token, email, name } = await loginUser(req.body);
  res.status(201).json({
    contentType: "application/json",
    ResponseBody: {
      user: {
        name,
        email,
      },
      token: token,
    },
  });
};

const logoutUserController = async (req, res, next) => {
  await logoutUser(req.user.token);
  res.sendStatus(204);
};

const signupUserController = async (req, res, next) => {
  const user = await signupUser(req.body);
  res.status(201).json({
    contentType: "application/json",
    ResponseBody: { user },
  });
};

const getCurrentUserController=async (req, res, next) => {
    const user = await currentUser(req.user.token);
    res.status(200).send(user);
  }

  const getVerifyTokenController=async (req, res, next) => {
    const user = await verificationUser(req.params.verificationToken);
    res.status(200).json({ message: "Verification successful", user });
  }

  const getVerifyController=async (req, res, next) => {
    const result = await verificationSecondUser(req.body);

    if (result) {
      res.status(200).json({ message: "Verification email send" });
    } else {
      res.status(400).json({ message: "Verification has already been passed" });
    }
  }

  const refreshTokenController=async (req, res, next) => {
    const user = await refreshMToken(req.user.token);
    res.status(200).send(user);
  };
  
module.exports = {
  signupUserController,
  signinUserController,
  logoutUserController,
  getCurrentUserController,
  getVerifyTokenController,
  getVerifyController,
  refreshTokenController
};
