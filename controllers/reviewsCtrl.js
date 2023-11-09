import asyncHandler from "express-async-handler";
import Review from "../model/Review.js";
import Product from "../model/Product.js";

export const createReviewCtrl = asyncHandler(async (req, res) => {
  const { message, rating } = req.body;
  const { productID } = req.params;

  const productFound = await Product.findById(productID).populate("reviews");

  if (!productFound) {
    throw new Error("Product not found");
  }

  const hasReviewed = productFound?.reviews?.find(
    (review) => review?.user?.toString() === req?.userAuthId?.toString()
  );

  if (hasReviewed) {
    throw new Error("You have already reviewed this product");
  }

  const review = await Review.create({
    message,
    rating,
    product: productFound?._id,
    user: req.userAuthId,
  });

  productFound.reviews.push(review);
  await productFound.save();

  res.status(201).json({
    status: true,
    message: "Review created successfully",
  });
});
