const express = require("express");
const mongoose = require("mongoose");
const compression = require("compression");
const expressStaticGzip = require("express-static-gzip");
const crypto = require("crypto");
var Schema = mongoose.Schema;
const cors = require("cors");
const app = express();
const path = require("path");
const root = path.join(__dirname, "/");
// app.use(express.static(root));
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // for form data
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);
app.use(
  "/",
  expressStaticGzip(root, {
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
// Utility to generate a hash-based cache key
function generateCacheKey(url, body) {
  const keyData = url + JSON.stringify(body);
  return "cache:" + crypto.createHash("md5").update(keyData).digest("hex");
}

// Cache middleware for POST requests
const cacheMiddleware = async (req, res, next) => {
  if (!req.originalUrl?.includes("flush-cache")) {
    const key = generateCacheKey(req.originalUrl, req.body);

    const cached = await client.get(key);
    if (cached) {
      console.log(`Serving from cache: ${key}`);
      return res.json(JSON.parse(cached));
    }

    // Intercept and cache the real response
    const originalJson = res.json.bind(res);
    res.json = async (body) => {
      if (res.statusCode === 200 && body?.isSuccess) {
        await client.setEx(key, 756000, JSON.stringify(body)); // cache for 240 hours = 10 days
      }
      return originalJson(body);
    };
  }
  next();
};

app.use(cacheMiddleware);

const redis = require("redis");

// Create a client
const client = redis.createClient({
  socket: {
    host: "127.0.0.1",
    port: 6379,
  },
}); // defaults to localhost:6379

// Connect to Redis
client
  .connect()
  .then(() => {
    console.log("Connected to Redis");
  })
  .catch(console.error);

process.on("SIGINT", async () => {
  await client.flushAll();
  await client.quit();
  console.log("Redis client disconnected");
  process.exit(0);
});

const affiliateBannerSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  name: { type: String, maxlength: 256, required: true },
  imgUrl: {
    type: String,
    default: "/logo.png",
  },
  affiliateLink: {
    type: String,
    required: true,
  },
  createdOn: { type: Date, default: Date.now },
  updatedOn: { type: Date, default: Date.now },
  isDeleted: { type: Boolean, default: false },
});

const brandSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  name: { type: String, maxlength: 256, required: true },
  logoUrl: {
    type: String,
    default: "/logo.png",
  },
  createdOn: { type: Date, default: Date.now },
  updatedOn: { type: Date, default: Date.now },
  isDeleted: { type: Boolean, default: false },
});
const categorySchema = new mongoose.Schema({
  _id: { type: String, required: true },
  name: { type: String, maxlength: 256, required: true },
  imgUrl: {
    type: String,
    default: "/logo.png",
  },
  createdOn: { type: Date, default: Date.now },
  updatedOn: { type: Date, default: Date.now },
  isDeleted: { type: Boolean, default: false },
});
const subCategorySchema = new mongoose.Schema({
  _id: { type: String, required: true },
  name: { type: String, maxlength: 256, required: true },
  imgUrl: {
    type: String,
    default: "/logo.png",
  },
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
  searchTerm: { type: String, required: true },
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
const AffiliateBanner = mongoose.model(
  "AffiliateBanner",
  affiliateBannerSchema
);

app.get("/flush-cache/:id", async (req, res) => {
  try {
    let cacheId = req.params.id;
    if (cacheId === "all") {
      await client.flushAll();
    }
    const response = {
      isSuccess: true,
      data: null,
      message: "DB Flush Successfully",
    };
    res.status(200).json(response);
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
});

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
        _id: -1,
      },
    });

    const products = await Product.aggregate(block1);

    const response = {
      isSuccess: true,
      data: products,
      message: "Products Fetched Successfully",
    };

    await client.set("/user/products", JSON.stringify(response));

    res.status(200).json(response);
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
        {
          thumbnailDetail: {
            $regex: ".*" + req.body.title.toString() + ".*",
            $options: "i",
          },
        },
      ];
    filters.isDeleted = false;
    if(req.body._idne) {
      filters._id = { $ne: ObjectId(req.body._idne) }
    }
    const blogs = await Blog.find(filters).sort({ _id: -1 });
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

app.post("/user/brands", async (req, res) => {
  try {
    const brands = await Brand.find({
      name: {
        $regex: ".*" + req.body.name.toString() + ".*",
        $options: "i",
      },
    }).sort({ _id: -1 });
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

app.post("/user/affiliate-banners", async (req, res) => {
  try {
    const banners = await AffiliateBanner.find({
      name: {
        $regex: ".*" + req.body.name.toString() + ".*",
        $options: "i",
      },
    }).sort({ _id: -1 });
    res.status(200).json({
      isSuccess: true,
      data: banners,
      message: "Affiliate Banners Fetched Successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
});

app.post("/user/categories", async (req, res) => {
  try {
    const categories = await Category.find({
      name: {
        $regex: ".*" + req.body.name.toString() + ".*",
        $options: "i",
      },
    }).sort({ _id: -1 });
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
app.post("/user/subcategories", async (req, res) => {
  try {
    const subCategories = await SubCategory.find({
      name: {
        $regex: ".*" + req.body.name.toString() + ".*",
        $options: "i",
      },
    }).sort({ _id: -1 });
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
