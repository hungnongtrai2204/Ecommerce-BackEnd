import asyncHandler from "express-async-handler";
import Coupon from "../model/Coupon.js";

export const createCouponCtrl = asyncHandler(async (req, res) => {
  const { code, startDate, endDate, discount } = req.body;

  const couponsExists = await Coupon.findOne({ code });

  if (couponsExists) {
    throw new Error("Coupon already exists");
  }

  if (isNaN(discount)) {
    throw new Error("Discount value must be a number");
  }

  const coupon = await Coupon.create({
    code: code?.toUpperCase(),
    startDate,
    endDate,
    discount,
    user: req.userAuthId,
  });

  res.status(201).json({
    status: "success",
    message: "Coupon created successfully",
    coupon,
  });
});

export const getAllCouponsCtrl = asyncHandler(async (req, res) => {
  const coupons = await Coupon.find();
  res.status(200).json({
    status: "success",
    message: "All coupons",
    coupons,
  });
});

export const getCouponCtrl = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findOne({
    code: req.query.code,
  });
  if (coupon === null) {
    throw new Error("Coupon not found");
  }
  if (coupon.isExpired) {
    throw new Error("Coupon expired");
  }
  res.json({
    status: "success",
    message: "Coupon fetched successfully",
    coupon,
  });
});

export const updateCouponCtrl = asyncHandler(async (req, res) => {
  const { code, startDate, endDate, discount } = req.body;
  const coupon = await Coupon.findByIdAndUpdate(
    req.params.id,
    {
      code: code?.toUpperCase(),
      discount,
      startDate,
      endDate,
    },
    {
      new: true,
    }
  );
  res.json({
    status: "success",
    message: "Coupon updated successfully",
    coupon,
  });
});

export const deleteCouponCtrl = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findByIdAndDelete(req.params.id);
  res.json({
    status: "success",
    message: "Coupon deleted successfully",
    coupon,
  });
});
