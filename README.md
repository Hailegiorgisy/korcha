# Korcha (ኮርቻ) — Shein Cross-Border E-Commerce Platform for Ethiopia (v5.1)

Korcha is an end-to-end e-commerce platform specifically built for Ethiopian shoppers to discover products on Shein, get automated price calculations in Ethiopian Birr (ETB), pay via Telebirr or Cash on Delivery, and receive landmark-routed doorstep delivery in Addis Ababa and surrounding regions.

---

## 🌟 Key Features

1. **Amharic-First Search-to-Shein Experience (SheinSearchHero.tsx)**
   - High-conversion search bar with quick Amharic category chips (ቀሚሶች, የወንዶች ሸሚዝ, ጫማዎች, ሁዲዎች, ኤሌክትሮኒክስ, መዋቢያዎች).
   - Seamlessly searches directly on Shein's global catalog without clunky static catalog clutter.

2. **Automated Link-Only Price Scraper (CostEstimator.tsx & sheinParserService.js)**
   - Customers paste **ONLY the Shein product link**.
   - Server-side parser automatically fetches the Shein product page, extracting title, thumbnail image, verified USD price, and available size/color options.
   - Calculates landed price in ETB with transparent breakdown:
     - **Formula**: `(Original USD * 1.50 Markup) * 188.0 Exchange Rate`
     - **Split**: 25% Telebirr Deposit + 75% Cash on Delivery (COD).

3. **Dual Payment Options (PaymentModal.tsx & telebirrRoutes.js)**
   - **Option 1**: 25% Advance Deposit via Telebirr (Pay to `+251911234567`, submit 10-character transaction code for real-time verification).
   - **Option 2**: 100% Cash on Delivery (COD) for zero upfront risk.

4. **Ethiopian Landmark & GPS Checkout (LandmarkCheckout.tsx)**
   - One-tap geolocation capture (`navigator.geolocation`).
   - Landmark-driven address fields (Subcity, Woreda, Famous Nearby Landmark, House/Building info).
   - Primary Phone + Mandatory Secondary Phone for foolproof delivery driver routing.

5. **Multi-Channel Worker Alerts & Dispatcher (notificationService.js & DispatcherDashboard.tsx)**
   - Instant real-time alerts sent to Korcha operations team via Telegram Bot and Email.
   - Internal dispatching dashboard to manage orders, customer support tickets, status updates, and Telebirr verification.

---

## 📁 Project Architecture

```
korcha-v5/
├── backend/
│   ├── config/
│   │   ├── notificationConfig.js
│   │   └── pricingConfig.js
│   ├── controllers/
│   │   ├── catalogController.js
│   │   ├── helpController.js
│   │   ├── orderController.js
│   │   ├── quoteController.js
│   │   └── telebirrController.js
│   ├── models/
│   │   ├── catalog_500.json
│   │   ├── HelpModel.js
│   │   ├── OrderModel.js
│   │   ├── ProductModel.js
│   │   └── QuoteModel.js
│   ├── routes/
│   │   ├── catalogRoutes.js
│   │   ├── helpRoutes.js
│   │   ├── orderRoutes.js
│   │   ├── quoteRoutes.js
│   │   └── telebirrRoutes.js
│   ├── services/
│   │   ├── notificationService.js
│   │   ├── pricingService.js
│   │   └── sheinParserService.js
│   ├── .env.example
│   ├── package.json
│   └── server.js
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── CartDrawer.tsx
    │   │   ├── CostEstimator.tsx
    │   │   ├── DispatcherDashboard.tsx
    │   │   ├── Header.tsx
    │   │   ├── HelpSupportModal.tsx
    │   │   ├── LandmarkCheckout.tsx
    │   │   ├── PaymentModal.tsx
    │   │   └── SheinSearchHero.tsx
    │   ├── types/
    │   │   └── index.ts
    │   ├── App.css
    │   ├── App.tsx
    │   └── main.tsx
    ├── index.html
    ├── package.json
    ├── tsconfig.json
    ├── tsconfig.node.json
    └── vite.config.ts
```

---

## 🚀 Quick Start Guide

### 1. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
npm start
# Server runs on http://localhost:5000
```

### 2. Frontend Setup
```bash
cd ../frontend
npm install
npm run dev
# App runs on http://localhost:5173
```

---

## 🧮 Pricing Formula Details

- **USD to ETB Rate**: 188.0
- **Markup**: 50% (Multiplier 1.50)
- **Total ETB**: Math.round((Scraped USD * 1.50) * 188.0)
- **25% Deposit**: Math.round(Total ETB * 0.25)
- **75% COD**: Total ETB - Deposit
