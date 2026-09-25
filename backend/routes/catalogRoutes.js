// backend/routes/catalogRoutes.js
import express from "express";
import { getCatalogProducts, syncDailyCatalog } from "../services/catalogService.js";

const router = express.Router();

router.get("/", (req, res) => {
  const products = getCatalogProducts();
  res.status(200).json({
    categories: ["clothes", "electronics", "cosmetics"],
    products,
  });
});

router.post("/sync", (req, res) => {
  const result = syncDailyCatalog();
  res.status(200).json(result);
});

export default router;
