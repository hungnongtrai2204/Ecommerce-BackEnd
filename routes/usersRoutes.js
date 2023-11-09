import express from "express";
import {
  getUserProfileCtrl,
  loginUserCtrl,
  registerUserCtrl,
  updateShippingAddressCtrl,
} from "../controllers/usersCtrl.js";
import { isLoggedIn } from "../middlewares/isLoggedIn.js";

const usersRoutes = express.Router();

usersRoutes.post("/register", registerUserCtrl);
usersRoutes.post("/login", loginUserCtrl);
usersRoutes.get("/profile", isLoggedIn, getUserProfileCtrl);
usersRoutes.put("/update/shipping", isLoggedIn, updateShippingAddressCtrl);

export default usersRoutes;
