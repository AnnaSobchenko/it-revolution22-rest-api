const { Users } = require("../db/usersModel");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const gravatar = require("gravatar");
const Jimp = require("jimp");
const fs = require("fs").promises;
const sgMail = require("@sendgrid/mail");
const uuid = require("uuid");

require("dotenv").config();

const signupUser = async (body) => {
  const verificationToken = uuid.v4();
  const { email, password, name } = body;

  const isSingup = await Users.create({
    name,
    email,
    password: await bcryptjs.hash(
      password,
      Number(process.env.BCRYPT_SALT_ROUNDS)
    ),
    verificationToken,
  });

  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  const msg = {
    to: email, // Change to your recipient
    from: "annsbchnk@gmail.com", // Change to your verified sender
    subject: "Sending  verification email",
    text: `https://it-revolution22-rest-api.herokuapp.com/api/users/verify/${verificationToken}`,
    html: `<p>Hello, verificy your email, please click <a href="https://it-revolution22-rest-api.herokuapp.com/api/users/verify/${verificationToken}">Confirm email</a></p>`,
  };
  sgMail
    .send(msg)
    .then(() => {
      console.log("Email sent");
    })
    .catch((error) => {
      console.error(error);
    });
  return isSingup;
};

const loginUser = async (body) => {
  console.log("body", body);
  const { email, password } = body;
  let user = await Users.findOne({ email, verify: true });
  console.log("user", user);
  const isPasswordCorrect = await bcryptjs.compare(password, user.password);
  console.log("isPasswordCorrect", isPasswordCorrect);
  if (isPasswordCorrect) {
    const token = jwt.sign({ sub: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });
    const refreshToken = jwt.sign({ sub: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN_REFRESH,
    });
    user = await Users.findOneAndUpdate(
      { email },
      { token, refreshToken },
      { new: true }
    );
    return user;
  }
};

const logoutUser = async (token) => {
  const user = await Users.findOneAndUpdate(
    { token },
    { token: null, refreshToken: null },
    { new: true }
  );
  return user;
};

const currentUser = async (token) => {
  const user = await Users.findOne({ token }, { email: 1, name: 1, _id: 0 });
  return user;
};

const verificationUser = async (verificationToken) => {
  console.log("verificationToken", verificationToken);
  const user = await Users.findOneAndUpdate(
    { verificationToken },
    {
      verificationToken: null,
      verify: true,
    },

    { new: true }
  );
  console.log("user", user);
  return user;
};

const verificationSecondUser = async (body) => {
  const { email } = body;
  const user = await Users.findOne({ email });
  if (!user.verify) {
    const verificationToken = uuid.v4();

    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    const msg = {
      to: email, // Change to your recipient
      from: "annsbchnk@gmail.com", // Change to your verified sender
      subject: "Sending  verification email",
      text: `https://it-revolution22-rest-api.herokuapp.com/api/users/verify/${verificationToken}`,
      html: `<p>Hello, verificy your email, please click <a href="https://it-revolution22-rest-api.herokuapp.com/api/users/verify/${verificationToken}">Confirm email</a></p>`,
    };
    return await sgMail
      .send(msg)
      .then(() => {
        console.log("Email sent");
        return true;
      })
      .catch((error) => {
        console.error(error);
      });
  } else {
    return false;
  }
};

const refreshMToken = async (token) => {
  userOld = await Users.findOne({ token }, { email: 1, _id: 1 });

  const accessToken = jwt.sign({ sub: userOld._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
  const refreshToken = jwt.sign({ sub: userOld._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN_REFRESH,
  });

  const user = await Users.findOneAndUpdate(
    { token },
    { token: accessToken, refreshToken },
    { new: true }
  );

  return user;
};

module.exports = {
  signupUser,
  loginUser,
  logoutUser,
  currentUser,
  verificationUser,
  verificationSecondUser,
  refreshMToken,
};
