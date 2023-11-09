import express from "express";
import { isLoggedIn } from "../middlewares/isLoggedIn.js";
import { createReviewCtrl } from "../controllers/reviewsCtrl.js";

const reviewsRoutes = express.Router();

reviewsRoutes.post("/:productID", isLoggedIn, createReviewCtrl);

export default reviewsRoutes;
