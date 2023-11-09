import express from "express";
import { isLoggedIn } from "../middlewares/isLoggedIn.js";
import {
  createOrderCtrl,
  getAllOrdersCtrl,
  getOrderStatsCtrl,
  getSingleOrderCtrl,
  updateOrderCtrl,
} from "../controllers/ordersCtrl.js";

const orderRoutes = express.Router();

orderRoutes.post("/", isLoggedIn, createOrderCtrl);
orderRoutes.get("/", isLoggedIn, getAllOrdersCtrl);
orderRoutes.get("/sales/stats", isLoggedIn, getOrderStatsCtrl);
orderRoutes.put("/update/:id", isLoggedIn, updateOrderCtrl);
orderRoutes.get("/:id", isLoggedIn, getSingleOrderCtrl);

export default orderRoutes;
