const express = require("express");
const mongoose = require("mongoose");
const compression = require("compression");
const expressStaticGzip = require("express-static-gzip");
var Schema = mongoose.Schema;
const cors = require("cors");
const app = express();
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // for form data
app.use(
  cors({
    origin: "https://thegreatproducts.com",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);
app.use(
  "/",
  expressStaticGzip("public", {
    enableBrotli: true,
    orderPreference: ["br", "gz"],
    setHeaders: (res, path) => {
      res.setHeader("Cache-Control", "public, max-age=31536000");
    },
  })
);
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`, req.body);
  next();
});
app.options("*", cors());
const ObjectId = require("mongodb").ObjectId;
// Connect to MongoDB
mongoose
  .connect(
    "mongodb+srv://product:test@cluster0.a5qfn.mongodb.net/productsDB?retryWrites=true&w=majority&appName=Cluster0",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      timeoutMS: 60000,
    }
  )
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("MongoDB Connection Error:", err));

const brandSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  name: { type: String, maxlength: 256, required: true },
  createdOn: { type: Date, default: Date.now },
  updatedOn: { type: Date, default: Date.now },
  isDeleted: { type: Boolean, default: false },
});
const categorySchema = new mongoose.Schema({
  _id: { type: String, required: true },
  name: { type: String, maxlength: 256, required: true },
  createdOn: { type: Date, default: Date.now },
  updatedOn: { type: Date, default: Date.now },
  isDeleted: { type: Boolean, default: false },
});
const subCategorySchema = new mongoose.Schema({
  _id: { type: String, required: true },
  name: { type: String, maxlength: 256, required: true },
  category: [{ type: Schema.Types.ObjectId, ref: "Category", required: true }],
  createdOn: { type: Date, default: Date.now },
  updatedOn: { type: Date, default: Date.now },
  isDeleted: { type: Boolean, default: false },
});
const blogSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  title: { type: String, maxlength: 256, required: true },
  url: { type: String, maxlength: 256, required: true },
  thumbnail: {
    type: String,
    default: "/logo.png",
  },
  thumbnailDetail: {
    type: String,
    default: "",
  },
  content: {
    type: String,
    required: true,
  },
  createdOn: { type: Date, default: Date.now },
  updatedOn: { type: Date, default: Date.now },
  isDeleted: { type: Boolean, default: false },
  products: { type: [Schema.Types.ObjectId], ref: "Product", default: [] },
  blogs: { type: [Schema.Types.ObjectId], ref: "Blog", default: [] },
  views: { type: Number, default: 0 },
});
const productSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  name: { type: String, maxlength: 256, required: true },
  brand: { type: Schema.Types.ObjectId, ref: "Brand", required: true },
  category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
  subCategory: {
    type: Schema.Types.ObjectId,
    ref: "SubCategory",
    required: true,
  },
  colors: { type: [String], default: [] },
  sizes: { type: [String], default: [] },
  createdOn: { type: Date, default: Date.now },
  updatedOn: { type: Date, default: Date.now },
  isDeleted: { type: Boolean, default: false },
  imgUrl: {
    type: String,
    default: "/logo.png",
  },
  affiliateLink: {
    type: String,
    required: true,
  },
});
const Brand = mongoose.model("Brand", brandSchema);
const Category = mongoose.model("Category", categorySchema);
const SubCategory = mongoose.model("SubCategory", subCategorySchema);
const Product = mongoose.model("Product", productSchema);
const Blog = mongoose.model("Blog", blogSchema);
// // Route to add a product
// app.post("/admin/products", async (req, res) => {
//   try {
//     const product = new Product(req.body);
//     product._id = new ObjectId();
//     await product.save();
//     res.status(201).send(product);
//   } catch (error) {
//     console.error(error);
//     res.status(400).send(error);
//   }
// });
// app.put("/admin/products/:id", async (req, res) => {
//   try {
//     const productId = req.params.id;

//     // Validate ObjectId format
//     if (!ObjectId.isValid(productId)) {
//       return res.status(400).json({ error: "Invalid product ID format" });
//     }

//     req.body.updatedOn = new Date();
//     delete req.body.createdOn;
//     delete req.body.isDeleted;
//     const updatedProduct = await Product.findByIdAndUpdate(
//       productId,
//       { $set: req.body },
//       { new: true, runValidators: true } // Return updated doc & validate fields
//     );

//     if (!updatedProduct) {
//       return res.status(404).json({ error: "Product not found" });
//     }

//     res.status(200).json(updatedProduct);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Server error" });
//   }
// });
// app.get("/admin/products/:id", async (req, res) => {
//   try {
//     const productId = req.params.id;

//     // Validate ObjectId format
//     if (!ObjectId.isValid(productId)) {
//       return res.status(400).json({ error: "Invalid product ID format" });
//     }

//     const product = await Product.findById(productId);

//     if (!product) {
//       return res.status(404).json({ error: "Product not found" });
//     }

//     res.status(200).json(product);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Server error" });
//   }
// });
// app.delete("/admin/products/:id", async (req, res) => {
//   try {
//     const productId = req.params.id;

//     // Validate ObjectId format
//     if (!ObjectId.isValid(productId)) {
//       return res.status(400).json({ error: "Invalid product ID format" });
//     }

//     const updatedProduct = await Product.findByIdAndUpdate(
//       productId,
//       { isDeleted: true }, // Mark as deleted
//       { new: true }
//     );

//     if (!updatedProduct) {
//       return res.status(404).json({ error: "Product not found" });
//     }

//     res.status(200).json({ message: "Product soft deleted", updatedProduct });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Server error" });
//   }
// });
// Route to search products with filters
app.post("/user/products", async (req, res) => {
  try {
    delete req.body.createdOn;
    delete req.body.updatedOn;
    delete req.body.isDeleted;
    const filters = {};

    filters.isDeleted = false;
    let block1 = [];
    block1.push({
      $match: filters,
    });

    block1.push(
      {
        $lookup: {
          from: "brands",
          localField: "brand",
          foreignField: "_id",
          as: "brand",
        },
      },
      {
        $lookup: {
          from: "categories",
          localField: "category",
          foreignField: "_id",
          as: "category",
        },
      },
      {
        $lookup: {
          from: "subcategories",
          localField: "subCategory",
          foreignField: "_id",
          as: "subCategory",
        },
      },
      {
        $unwind: "$category",
      },
      {
        $unwind: "$subCategory",
      },
      {
        $unwind: "$brand",
      }
    );
    if (
      req.body.name.toLowerCase() &&
      !req.body.brands.length &&
      !req.body.categories.length &&
      !req.body.subCategories.length
    ) {
      block1.push({
        $match: {
          $or: [
            { name: { $regex: req.body.name.toLowerCase(), $options: "i" } },
            {
              "brand.name": {
                $regex: req.body.name.toLowerCase(),
                $options: "i",
              },
            },
            {
              "category.name": {
                $regex: req.body.name.toLowerCase(),
                $options: "i",
              },
            },
            {
              "subCategory.name": {
                $regex: req.body.name.toLowerCase(),
                $options: "i",
              },
            },
          ],
        },
      });
    } else if (
      !req.body.name.toLowerCase() &&
      (req.body.brands.length ||
        req.body.categories.length ||
        req.body.subCategories.length)
    ) {
      block1.push({
        $match: {
          $or: [
            {
              "brand._id": { $in: req.body.brands.map((x) => new ObjectId(x)) },
            },
            {
              "category._id": {
                $in: req.body.categories.map((x) => new ObjectId(x)),
              },
            },
            {
              "subCategory._id": {
                $in: req.body.subCategories.map((x) => new ObjectId(x)),
              },
            },
          ],
        },
      });
    } else if (
      req.body.name.toLowerCase() &&
      (req.body.brands.length ||
        req.body.categories.length ||
        req.body.subCategories.length)
    ) {
      block1.push({
        $match: {
          $or: [
            {
              "brand._id": { $in: req.body.brands.map((x) => new ObjectId(x)) },
            },
            {
              "category._id": {
                $in: req.body.categories.map((x) => new ObjectId(x)),
              },
            },
            {
              "subCategory._id": {
                $in: req.body.subCategories.map((x) => new ObjectId(x)),
              },
            },
            { name: { $regex: req.body.name.toLowerCase(), $options: "i" } },
            {
              "brand.name": {
                $regex: req.body.name.toLowerCase(),
                $options: "i",
              },
            },
            {
              "category.name": {
                $regex: req.body.name.toLowerCase(),
                $options: "i",
              },
            },
            {
              "subCategory.name": {
                $regex: req.body.name.toLowerCase(),
                $options: "i",
              },
            },
          ],
        },
      });
    }

    block1.push({ $unset: ["isDeleted", "createdOn", "updatedOn", "__v"] });
    block1.push({
      $sort: {
        updatedOn: -1,
        createdOn: -1,
      },
    });
    block1.push({
      $limit: 1000,
    });

    const products = await Product.aggregate(block1);

    res.status(200).json({
      isSuccess: true,
      data: products,
      message: "Products Fetched Successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
});

app.post("/user/blogs", async (req, res) => {
  try {
    const filters = {};
    if (req.body.title)
      filters["$or"] = [
        {
          title: {
            $regex: ".*" + req.body.title.toString() + ".*",
            $options: "i",
          },
        },
        {
          content: {
            $regex: ".*" + req.body.title.toString() + ".*",
            $options: "i",
          },
        },
      ];
    filters.isDeleted = false;
    const blogs = await Blog.find(filters)
      .sort({ views: -1, updatedOn: -1, createdOn: -1 })
      .limit(100);
    res.status(200).json({
      isSuccess: true,
      data: blogs,
      message: "Blogs Fetched Successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
});

app.post("/user/blog", async (req, res) => {
  try {
    const blogUrl = req.body.url;
    const blog = await Blog.findOneAndUpdate(
      { url: blogUrl, isDeleted: false },
      { $inc: { views: 1 } },
      { new: true, runValidators: true }
    );

    if (!blog) {
      return res.status(404).json({ error: "Blog not found" });
    }
    const productIds = blog.products.map((y) => y.toString());
    const dbProducts = await Product.find({
      isDeleted: false,
      _id: { $in: JSON.parse(JSON.stringify([productIds.toString()] || '[]')) || [] },
    });
    console.log(
      dbProducts
    );
    const products = dbProducts.map((y) => {
      return products.find((z) => z._id === new ObjectId(y.toString()));
    });
    const dbBlogs = await Blog.find({
      isDeleted: false,
    }).sort({
      views: -1,
      updatedOn: -1,
      createdOn: -1,
    });
    blog.products = products;
    blog.blogs = dbBlogs;
    res.status(200).json({
      isSuccess: true,
      data: blog,
      message: "Blog Fetched Successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
});

app.get("/user/brands", async (req, res) => {
  try {
    const brands = await Brand.find();
    res.status(200).json({
      isSuccess: true,
      data: brands,
      message: "Brands Fetched Successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
});

app.get("/user/categories", async (req, res) => {
  try {
    const categories = await Category.find();
    res.status(200).json({
      isSuccess: true,
      data: categories,
      message: "Categories Fetched Successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
});
app.get("/user/subcategories", async (req, res) => {
  try {
    const subCategories = await SubCategory.find();
    res.status(200).json({
      isSuccess: true,
      data: subCategories,
      message: "Subcategories Fetched Successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
});
const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
