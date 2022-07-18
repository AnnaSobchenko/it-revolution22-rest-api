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
  const { email, password } = body;
  let user = await Users.findOne({ email, verify: true });

  const isPasswordCorrect = await bcryptjs.compare(password, user.password);

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

const getAllContacts = async (email) => {
  const result = await Users.findOne({ email });
  return result.contacts;
};
const getAllUsers = async () => {
  const result = await Users.find(
    {},
    { email: 1, _id: 1, name: 1, contacts: 1 }
  );
  return result;
};
const getInfo = async ({ email }) => {
  const result = await Users.find({ email }, { email: 1, _id: 1, name: 1 });
  return result;
};
const deleteOneUser = async (_id) => {
  const result = await Users.findOneAndDelete({ _id });
  return result;
};

const addNewContact = async ({ name, number, email }) => {
  try {
    const result = await Users.findOne({ email });

    const contactId = uuid.v4();

    const addContact = {
      name,
      number,
      id: contactId,
    };

    const updateContacts = await Users.findOneAndUpdate(
      { email },
      { contacts: [...result.contacts, addContact] },
      { new: true }
    );
    return updateContacts;
  } catch (err) {
    console.error(err);
  }
};

const updateOneContact = async (id, body) => {
  const { name, number, email } = body;

  try {
    const result = await Users.findOne({ email });
    const newContacts = result.contacts.map((el) => {
      if (el.id === id) {
        el.name = name;
        el.number = number;
      }
      return el;
    });

    const updateContact = await Users.findOneAndUpdate(
      { email },
      { contacts: newContacts },
      { new: true }
    );

    return updateContact;
  } catch (err) {
    console.error(err);
  }
};

const deleteContactById = async ({ email, contactId }) => {
  const result = await Users.findOne({ email });

  const delContacts = result.contacts.filter((el) => el.id !== contactId);

  const updateContact = await Users.findOneAndUpdate(
    { email },
    { contacts: delContacts },
    { new: true }
  );

  return updateContact;
};

module.exports = {
  signupUser,
  loginUser,
  logoutUser,
  currentUser,
  verificationUser,
  verificationSecondUser,
  refreshMToken,
  getAllContacts,
  addNewContact,
  updateOneContact,
  deleteContactById,
  getAllUsers,
  deleteOneUser,
  getInfo,
};
