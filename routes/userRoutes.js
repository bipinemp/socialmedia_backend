import express from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  getUserProfile,
  getUserProfiles,
} from "../controllers/userController.js";
import { protect } from "../middlewares/authMiddleware.js";
const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);

router.route("/profile").get(protect, getUserProfile);
router.route("/profiles").get(protect, getUserProfiles);

export default router;
