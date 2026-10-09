import express from "express";
import {
  getSavedJobs,
  login,
  logout,
  register,
  saveJob,
  unsaveJob,
  updateProfile,
} from "../controllers/user.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import authorizeRoles from "../middlewares/authorizeRoles.js";
import { uploadImage, uploadProfileFiles } from "../middlewares/multer.js";
import { authLimiter } from "../middlewares/security.js";

const router = express.Router();
const isStudent = authorizeRoles("student");

router.route("/register").post(authLimiter, uploadImage, register);
router.route("/login").post(authLimiter, login);
router
  .route("/profile/update")
  .post(isAuthenticated, uploadProfileFiles, updateProfile);
// POST (not GET) so another site can't log users out with a plain link
router.route("/logout").post(logout);

router.route("/saved-jobs").get(isAuthenticated, isStudent, getSavedJobs);
router
  .route("/saved-jobs/:jobId")
  .put(isAuthenticated, isStudent, saveJob)
  .delete(isAuthenticated, isStudent, unsaveJob);

export default router;
