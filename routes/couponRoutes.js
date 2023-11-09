import express from "express";
import { isLoggedIn } from "../middlewares/isLoggedIn.js";
import {
  createCouponCtrl,
  deleteCouponCtrl,
  getAllCouponsCtrl,
  getCouponCtrl,
  updateCouponCtrl,
} from "../controllers/couponCtrl.js";
import isAdmin from "../middlewares/isAdmin.js";

const couponRoutes = express.Router();

couponRoutes.post("/", isLoggedIn, isAdmin, createCouponCtrl);
couponRoutes.get("/", getAllCouponsCtrl);
couponRoutes.get("/single", getCouponCtrl);
couponRoutes.put("/update/:id", isLoggedIn, isAdmin, updateCouponCtrl);
couponRoutes.delete("/delete/:id", isLoggedIn, isAdmin, deleteCouponCtrl);

export default couponRoutes;
