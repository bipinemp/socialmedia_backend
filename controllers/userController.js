import asyncHandler from "express-async-handler";
import User from "../models/userModel.js";
import generateToken from "../utils/generateToken.js";

// desc: Register a new user
// route: POST /api/users/register
// access: PUBLIC
const registerUser = asyncHandler(async (req, res) => {
  const { username, email, password, profilePicture, bio } = req.body;

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error("User already exists");
  }

  const user = await User.create({
    username,
    email,
    password,
    profilePicture,
    bio,
  });

  if (user) {
    return res.status(201).json({
      message: "Successfully Registered",
      user,
      status: 201,
    });
  } else {
    res.status(400);
    throw new Error("Invalid user data");
  }
});

// desc: Login the user
// route: POST /api/users/login
// access: PUBLIC
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await user.matchPasswords(password))) {
    generateToken(res, user._id);
    res.cookie("username", user.username);
    return res.status(201).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      status: 201,
    });
  } else {
    res.status(400);
    throw new Error("Invalid credentials");
  }
});

// desc: Logout the user
// route: POST /api/users/logout
// access: PRIVATE
const logoutUser = asyncHandler(async (req, res) => {
  res.cookie("jwt", "", {
    httpOnly: true,
    expires: new Date(0),
  });
  res.status(200).json({ message: "User logged Out" });
});

// desc: Get Profile of the user
// route: POST /api/users/profile
// access: PRIVATE
const getUserProfile = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const user = await User.findById(userId);

  if (user) {
    const user = {
      _id: req.user._id,
      name: req.user.username,
      email: req.user.email,
    };
    res.status(200).json({ message: "User Profile", user });
  } else {
    res.status(404);
    throw new Error("User not Found");
  }
});

// desc: Get Profile of the user
// route: POST /api/users/profiles
// access: PRIVATE
const getUserProfiles = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const user = await User.findById(userId);

  if (user) {
    const user = {
      _id: req.user._id,
      name: req.user.username,
      email: req.user.email,
    };
    res.status(200).json({ message: "User Profile", user });
  } else {
    res.status(404);
    throw new Error("User not Found");
  }
});

export { registerUser, loginUser, logoutUser, getUserProfile, getUserProfiles };
