import { Router } from "express";
import {
  getAllUsers,
  login,
  register,
  setAvatar,
  getUser,
} from "../controllers/usersController.js";
const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/setAvatar/:id", setAvatar);
router.get("/allusers/:id", getAllUsers);
router.get("/getUser/:id", getUser);

export default router;
