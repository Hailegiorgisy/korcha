// backend/server.js
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import catalogRoutes from "./routes/catalogRoutes.js";
import quoteRoutes from "./routes/quoteRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import telebirrRoutes from "./routes/telebirrRoutes.js";
import helpRoutes from "./routes/helpRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// API health check
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "Korcha (ኮርቻ) Concierge API",
    version: "5.1.0",
    exchangeRateEtb: 188.0,
    timestamp: new Date().toISOString(),
  });
});

// Mount MVC API routes
app.use("/api/catalog", catalogRoutes);
app.use("/api/quotes", quoteRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/telebirr", telebirrRoutes);
app.use("/api/help", helpRoutes);

// Production Static Serving for Vite React Build
const frontendDistPath = path.resolve(__dirname, "../frontend/dist");
app.use(express.static(frontendDistPath));

// Fallback to index.html for client-side SPA routing
app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api") || req.path.startsWith("/health")) {
    return next();
  }
  const indexPath = path.join(frontendDistPath, "index.html");
  res.sendFile(indexPath, (err) => {
    if (err) {
      res.status(200).send(`
        <!DOCTYPE html>
        <html lang="am">
        <head>
          <meta charset="UTF-8" />
          <title>Korcha (ኮርቻ) API Server</title>
          <style>
            body { font-family: sans-serif; text-align: center; padding: 40px; background: #0f172a; color: #f8fafc; }
            h1 { color: #f43f5e; }
            .card { background: #1e293b; padding: 24px; border-radius: 12px; display: inline-block; max-width: 600px; }
            code { background: #334155; padding: 4px 8px; border-radius: 4px; color: #38bdf8; }
          </style>
        </head>
        <body>
          <div class="card">
            <h1>Korcha (ኮርቻ) API Server is Running!</h1>
            <p>API endpoints are active under <code>/api/...</code></p>
            <p>To serve the full user interface, build the frontend by running:</p>
            <p><code>cd frontend && npm install && npm run build</code></p>
          </div>
        </body>
        </html>
      `);
    }
  });
});

app.listen(PORT, () => {
  console.log(`✅ Korcha (ኮርቻ) Production Server running on port ${PORT}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 API Base: http://localhost:${PORT}/api`);
});

export default app;
