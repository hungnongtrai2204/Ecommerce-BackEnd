import asyncHandler from "express-async-handler";
import Product from "../model/Product.js";
import Category from "../model/Category.js";
import Brand from "../model/Brand.js";

export const createProductCtrl = asyncHandler(async (req, res) => {
  //console.log(req.files);
  const convertedImgs = req.files.map((file) => file?.path);
  const { name, description, brand, category, sizes, colors, price, totalQty } =
    req.body;

  const productExits = await Product.findOne({ name });

  if (productExits) {
    throw new Error("Product Already Exists");
  }

  const brandFound = await Brand.findOne({
    name: brand?.toLowerCase(),
  });

  if (!brandFound) {
    throw new Error(
      "Brand not found, please create brand first or check brand name"
    );
  }

  const categoryFound = await Category.findOne({
    name: category,
  });

  if (!categoryFound) {
    throw new Error(
      "Category not found, please create category first or check category name"
    );
  }

  const product = await Product.create({
    name,
    description,
    brand,
    category,
    sizes,
    colors,
    user: req.userAuthId,
    price,
    totalQty,
    images: convertedImgs,
  });

  categoryFound.products.push(product._id);
  await categoryFound.save();

  brandFound.products.push(product._id);
  await brandFound.save();

  res.status(201).json({
    status: "success",
    message: "Product created successfully",
    product,
  });
});

export const getProductsCtrl = asyncHandler(async (req, res) => {
  let productQuery = Product.find();

  //filter by brand
  if (req.query.brand) {
    productQuery = productQuery.find({
      brand: { $regex: req.query.brand, $options: "i" },
    });
  }

  //filter by category
  if (req.query.category) {
    productQuery = productQuery.find({
      category: { $eq: req.query.category },
    });
  }

  //filter by color
  if (req.query.color) {
    productQuery = productQuery.find({
      colors: { $regex: req.query.color, $options: "i" },
    });
  }

  //filter by size
  if (req.query.size) {
    productQuery = productQuery.find({
      sizes: { $regex: req.query.size, $options: "i" },
    });
  }
  //filter by price range
  if (req.query.price) {
    const priceRange = req.query.price.split("-");
    //gte: greater or equal
    //lte: less than or equal to
    productQuery = productQuery.find({
      price: { $gte: priceRange[0], $lte: priceRange[1] },
    });
  }

  //sort by price
  if (req.query.sort === "Price: Low to High") {
    productQuery = productQuery.sort({ price: 1 });
  } else if (req.query.sort === "Price: High to Low") {
    productQuery = productQuery.sort({ price: -1 });
  } else if (req.query.sort === "Best Rating") {
    productQuery = productQuery.sort({ averageRating: -1 });
  } else if (req.query.sort === "Newest") {
    productQuery = productQuery.sort({ createdAt: -1 });
  }
  const page = parseInt(req.query.page) ? parseInt(req.query.page) : 1;
  const limit = parseInt(req.query.limit) ? parseInt(req.query.limit) : 10;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await Product.countDocuments();

  productQuery = productQuery.skip(startIndex).limit(limit);

  const pagination = {};
  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit,
    };
  }

  if (startIndex > 0) {
    pagination.pre = {
      page: page - 1,
      limit,
    };
  }

  const products = await productQuery.populate("reviews");
  res.json({
    status: "success",
    total,
    results: products.length,
    pagination,
    message: "Product fetched successfully",
    products,
  });
});

export const getProductCtrl = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).populate({
    path: "reviews",
    populate: {
      path: "user",
      select: "fullname",
    },
  });
  if (!product) {
    throw new Error("Product not found");
  }
  res.json({
    status: "success",
    message: "Product fetched successfully",
    product,
  });
});

export const updateProductCtrl = asyncHandler(async (req, res) => {
  const {
    name,
    description,
    brand,
    category,
    sizes,
    colors,
    user,
    price,
    totalQty,
  } = req.body;

  const product = await Product.findByIdAndUpdate(
    req.params.id,
    {
      name,
      description,
      brand,
      category,
      sizes,
      colors,
      user,
      price,
      totalQty,
    },
    {
      new: true,
      runValidators: true,
    }
  );
  res.json({
    status: "success",
    message: "Product updated successfully",
    product,
  });
});

export const deleteProductCtrl = asyncHandler(async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);
  res.json({
    status: "success",
    message: "Product deleted successfully",
  });
});
