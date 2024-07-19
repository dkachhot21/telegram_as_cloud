const { constants } = require("../constants");
const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

//@desc Register a user
//@route POST /user/register
//@access public
const registerUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  //Check if any field is empty
  if (!username || !email || !password) {
    res.status(400);
    throw new Error("All fields are mandatory");
  }
  const userAvailable = await User.findOne({ email });

  //If the user with this email already exists
  if (userAvailable) {
    res.status(constants.BAD_REQUEST);
    throw new Error("User already exists!");
  }
  //Hashed Password
  const hashedPassword = await bcrypt.hash(password, 10);

  //Create and save a new user
  const user = await User.create({
    username,
    email,
    password: hashedPassword,
  });

  //Check if user is successfully registered
  if (user) {
    res.status(constants.CREATED).json({
      message: "Registered",
      success: true,
      _id: user.id,
      email: user.email,
    });
  } else {
    res.status(constants.BAD_REQUEST);
    throw new Error("User Data is not Valid");
  }
});

//@desc Login a user
//@route POST /user/login
//@access public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(constants.BAD_REQUEST);
    throw new Error("All fields are mandatory");
  }

  const user = await User.findOne({ email });

  if (!user) {
    res.status(constants.NOT_FOUND);
    throw new Error("User Not Found");
  }

  //Compare Password
  if (user && (await bcrypt.compare(password, user.password))) {
    const accessToken = jwt.sign(
      {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
        },
      },
      process.env.ACCESS_TOKEN_KEY,
      { expiresIn: "30m" }, //Token Expiration time
    );
    res.status(constants.OK).json({ accessToken });
  } else {
    res.status(constants.UNAUTHORIZED);
    throw new Error("Incorrect Password");
  }
});

//@desc Get current user
//@route GET /user/current
//@access private
const currentUser = asyncHandler(async (req, res) => {
  res.json(req.user);
});

module.exports = { registerUser, loginUser, currentUser };
