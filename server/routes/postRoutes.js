import express from "express";
import * as dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary";

import post from "../mongodb/models/post.js";

dotenv.config();

const router = express.Router();

// Basic GET route for testing
router.route("/").get((req, res) => {
  res.status(200).json({ message: "Post route working!" });
});

export default router;
