import express from "express";
import { isLoggedIn } from "../middlewares/isLoggedIn.js";
import {
  createColorCtrl,
  deleteColorCtrl,
  getAllColorsCtrl,
  getSingleColorCtrl,
  updateColorCtrl,
} from "../controllers/colorsCtrl.js";
import isAdmin from "../middlewares/isAdmin.js";

const colorsRoutes = express.Router();

colorsRoutes.post("/", isLoggedIn, isAdmin, createColorCtrl);
colorsRoutes.get("/", getAllColorsCtrl);
colorsRoutes.get("/:id", getSingleColorCtrl);
colorsRoutes.put("/:id", isLoggedIn, isAdmin, updateColorCtrl);
colorsRoutes.delete("/:id", isLoggedIn, isAdmin, deleteColorCtrl);

export default colorsRoutes;
