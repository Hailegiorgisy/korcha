// backend/server.js
import express from "express";
import cors from "cors";
import catalogRoutes from "./routes/catalogRoutes.js";
import quoteRoutes from "./routes/quoteRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import telebirrRoutes from "./routes/telebirrRoutes.js";
import helpRoutes from "./routes/helpRoutes.js";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Mount MVC API routes
app.use("/api/catalog", catalogRoutes);
app.use("/api/quotes", quoteRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/telebirr", telebirrRoutes);
app.use("/api/help", helpRoutes);

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "Korcha (ኮርቻ) Concierge API",
    version: "3.0.0",
    exchangeRateEtb: 188.0,
  });
});

app.listen(PORT, () => {
  console.log(`Korcha Concierge API running on port ${PORT}`);
});
