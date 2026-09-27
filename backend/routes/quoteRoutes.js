// backend/routes/quoteRoutes.js
import express from "express";
import { quoteController } from "../controllers/quoteController.js";

const router = express.Router();

router.post("/parse-url", quoteController.parseUrl);
router.post("/request", quoteController.createQuoteRequest);
router.get("/:id", quoteController.getQuoteById);
router.post("/calculate", quoteController.calculateCustomPrice);

export default router;
