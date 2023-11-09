import express from "express";
import { isLoggedIn } from "../middlewares/isLoggedIn.js";
import {
  createCategoryCtrl,
  deleteCategoryCtrl,
  getAllCategoriesCtrl,
  getSingleCategoryCtrl,
  updateCategoryCtrl,
} from "../controllers/categoriesCtrl.js";
import catetgoryFileUpload from "../config/categoryUpload.js";

const categoriesRoutes = express.Router();

categoriesRoutes.post(
  "/",
  isLoggedIn,
  catetgoryFileUpload.single("file"),
  createCategoryCtrl
);
categoriesRoutes.get("/", getAllCategoriesCtrl);
categoriesRoutes.get("/:id", getSingleCategoryCtrl);
categoriesRoutes.put("/:id", updateCategoryCtrl);
categoriesRoutes.delete("/:id", deleteCategoryCtrl);

export default categoriesRoutes;
