import asyncHandler from "express-async-handler";
import dotenv from "dotenv";
dotenv.config();
import User from "../model/User.js";
import Order from "../model/Order.js";
import Product from "../model/Product.js";
import Stripe from "stripe";
import Coupon from "../model/Coupon.js";

const stripe = new Stripe(process.env.STRIPE_KEY);
export const createOrderCtrl = asyncHandler(async (req, res) => {
  // const { coupon } = req?.query;

  // const couponFound = await Coupon.findOne({
  //   code: coupon?.toUpperCase(),
  // });
  // if (couponFound?.isExpired) {
  //   throw new Error("Coupon has expired");
  // }
  // if (!couponFound) {
  //   throw new Error("Coupon doeas exists");
  // }
  // const discount = couponFound?.discount / 100;
  const { orderItems, shippingAddress, totalPrice, cod } = req.body;
  const user = await User.findById(req.userAuthId);

  if (!user?.hasShippingAddress) {
    throw new Error("Please provide shipping address");
  }
  if (orderItems?.length <= 0) {
    throw new Error("No Order Items");
  }

  const order = await Order.create({
    user: user._id,
    orderItems,
    shippingAddress,
    // totalPrice: couponFound ? totalPrice - totalPrice * discount : totalPrice,
    totalPrice,
  });
  console.log(order);

  const products = await Product.find({
    _id: { $in: orderItems },
  });

  orderItems?.map(async (order) => {
    const product = products?.find((product) => {
      return product?._id?.toString() === order?._id?.toString();
    });
    if (product) {
      product.totalSold += order.qty;
    }
    await product.save();
  });

  user.orders.push(order._id);
  await user.save();
  if (cod) {
    res.send({ url: "https://marvelous-syrniki-a26e41.netlify.app/success" });
  }
  const convertedOrders = orderItems.map((item) => {
    return {
      price_data: {
        currency: "usd",
        product_data: {
          name: item?.name,
          description: item?.description,
        },
        unit_amount: item?.price * 100,
      },
      quantity: item?.qty,
    };
  });
  const session = await stripe.checkout.sessions.create({
    line_items: convertedOrders,
    metadata: {
      orderId: JSON.stringify(order?._id),
    },
    mode: "payment",
    success_url: "https://marvelous-syrniki-a26e41.netlify.app/success",
    cancel_url: "http://localhost:3000/cancel",
  });

  res.send({ url: session.url });
});

export const getAllOrdersCtrl = asyncHandler(async (req, res) => {
  const orders = await Order.find().sort({ createdAt: -1 }).populate("user");
  res.json({
    status: "success",
    message: "All orders",
    orders,
  });
});

export const getSingleOrderCtrl = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const order = await Order.findById(id);
  res.json({
    status: true,
    message: "Single order",
    order,
  });
});

export const updateOrderCtrl = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const updatedOrder = await Order.findByIdAndUpdate(
    id,
    {
      status: req.body.status,
    },
    {
      new: true,
    }
  );
  res.status(200).json({
    status: true,
    message: "Order updated",
    updatedOrder,
  });
});

export const getOrderStatsCtrl = asyncHandler(async (req, res) => {
  const orders = await Order.aggregate([
    {
      $group: {
        _id: null,

        miniumSale: {
          $min: "$totalPrice",
        },

        totalSales: {
          $sum: "$totalPrice",
        },

        maxSale: {
          $max: "$totalPrice",
        },

        avgSale: {
          $avg: "$totalPrice",
        },
      },
    },
  ]);

  const date = new Date();
  const today = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const saleToday = await Order.aggregate([
    {
      $match: {
        createdAt: {
          $gte: today,
        },
      },
    },
    {
      $group: {
        _id: null,
        totalSales: {
          $sum: "$totalPrice",
        },
      },
    },
  ]);

  res.status(200).json({
    status: true,
    message: "Sum of order",
    orders,
    saleToday,
  });
});
