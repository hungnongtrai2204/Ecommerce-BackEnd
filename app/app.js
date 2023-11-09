import dotenv from "dotenv";
dotenv.config();
import express from "express";
import dbConnect from "../config/dbConnect.js";
import usersRoutes from "../routes/usersRoutes.js";
import { globalErrHandler, notFound } from "../middlewares/globalErrHandler.js";
import productsRoutes from "../routes/productsRoutes.js";
import categoriesRoutes from "../routes/categoriesRoutes.js";
import brandsRoutes from "../routes/brandsRoutes.js";
import reviewsRoutes from "../routes/reviewsRoutes.js";
import orderRoutes from "../routes/ordersRoutes.js";
import colorsRoutes from "../routes/colorsRoutes.js";
import Stripe from "stripe";
import Order from "../model/Order.js";
import couponRoutes from "../routes/couponRoutes.js";
import cors from "cors";
dbConnect();

const app = express();
app.use(cors());

//stripe webhook
const stripe = new Stripe(process.env.STRIPE_KEY);

// This is your Stripe CLI webhook secret for testing your endpoint locally.
const endpointSecret = "whsec_daorDNpjvFbuzNgRyYnmCSw4cf39Phbk";
// const endpointSecret = "https://nodejs-ecommerce-api-oe87.onrender.com";

// Use JSON parser for all non-webhook routes
app.use((req, res, next) => {
  if (req.originalUrl === "/webhook") {
    next();
  } else {
    express.json()(req, res, next);
  }
});

app.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  async (request, response) => {
    const sig = request.headers["stripe-signature"];

    let event;

    try {
      event = stripe.webhooks.constructEvent(request.body, sig, endpointSecret);
      // console.log(event);
    } catch (err) {
      // console.log("err", err.message);
      response.status(400).send(`Webhook Error: ${err.message}`);
      return;
    }
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const { orderId } = session.metadata;
      const paymentStatus = session.payment_status;
      const paymentMethod = session.payment_method_types[0];
      const totalAmount = session.amount_total;
      const currency = session.currency;

      const order = await Order.findByIdAndUpdate(
        JSON.parse(orderId),
        {
          totalPrice: totalAmount / 100,
          currency,
          paymentMethod,
          paymentStatus,
        },
        {
          new: true,
        }
      );
      console.log(order);
    } else {
      return;
    }
    // // Handle the event
    // switch (event.type) {
    //   case "payment_intent.succeeded":
    //     const paymentIntentSucceeded = event.data.object;
    //     // Then define and call a function to handle the event payment_intent.succeeded
    //     break;
    //   // ... handle other event types
    //   default:
    //     console.log(`Unhandled event type ${event.type}`);
    // }

    // Return a 200 response to acknowledge receipt of the event
    response.send();
  }
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/v1/users/", usersRoutes);
app.use("/api/v1/products/", productsRoutes);
app.use("/api/v1/categories/", categoriesRoutes);
app.use("/api/v1/brands/", brandsRoutes);
app.use("/api/v1/colors/", colorsRoutes);
app.use("/api/v1/reviews/", reviewsRoutes);
app.use("/api/v1/orders/", orderRoutes);
app.use("/api/v1/coupons/", couponRoutes);

app.use(notFound);
app.use(globalErrHandler);

export default app;
