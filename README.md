# Korcha (ኮርቻ) — Web Version

> **ከቻይና እቃዎች ወደ ኢትዮጵያ በታማኝነት • China to Ethiopia Cross-Border Shopping Concierge**  
> Direct concierge for **Shein (ሼይን)**, **Temu (ቴሙ)**, and **AliExpress (አሊኤክስፕረስ)** with 25% advance deposit (Telebirr / CBE Birr), 75% Cash on Delivery, and live door-to-door tracking.

---

## 🚀 Quick Start (Local Development)

```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm run dev
```

Visit `http://localhost:3000` or `http://localhost:5173`.

---

## 🌐 How to Publish / Deploy the Website

This repository is structured as a **standard, zero-config Vite + React web application**. You can publish it to any cloud host in under 2 minutes:

### Option 1: Vercel (Recommended — 1-Click Deploy)
1. Go to [vercel.com](https://vercel.com) and import this repository (`Hailegiorgisy/korcha`).
2. Settings are detected automatically:
   - **Framework Preset:** `Vite`
   - **Root Directory:** `./`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
3. Click **Deploy**.

### Option 2: Netlify
1. Go to [netlify.com](https://netlify.com) and click **"Add new site" > "Import an existing project"**.
2. Select GitHub and choose `Hailegiorgisy/korcha`.
3. Build Settings:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
4. Click **Deploy**.

### Option 3: Cloudflare Pages
1. In Cloudflare Dashboard, go to **Workers & Pages > Create application > Pages > Connect to Git**.
2. Select `Hailegiorgisy/korcha`.
3. Build preset: **Vite** (`npm run build`, output: `dist`).
4. Click **Save and Deploy**.

### Option 4: Linux VPS / Ethio Telecom / Docker / Node.js
If you run your own Linux VPS server or cloud instance:
```bash
# 1. Install dependencies
npm install

# 2. Build production bundle
npm run build

# 3. Start production server (serves the website on port 3000 or $PORT)
npm start
```

---

## 📁 Clean Project Structure

```
korcha/
├── index.html            # Main HTML entry point with metadata & SEO
├── package.json          # Dependencies & build scripts
├── vite.config.ts        # Vite build configuration & Tailwind CSS
├── tsconfig.json         # TypeScript configuration
├── server.js             # Optional lightweight Node production server
├── public/               # Static assets & favicon
│   └── favicon.ico
└── src/
    ├── App.tsx           # Main application state & tab coordinator
    ├── main.tsx          # React 19 root mounting
    ├── index.css         # Tailwind v4 styles & themes
    ├── components/
    │   ├── Header.tsx                    # Top navigation with live orders badge
    │   ├── MyOrdersView.tsx              # Phone number order history & 7-stage live tracking
    │   ├── TelegramSimulator.tsx         # Full Telegram bot interactive simulator
    │   ├── MarketplaceCalculator.tsx     # Price estimator, worker portal & Telebirr QR checkout
    │   ├── MarketplaceSearchExplorer.tsx # Shein, Temu & AliExpress store browser
    │   ├── WorkerDispatchDashboard.tsx   # Worker queue, calculator tool & approval
    │   ├── PaymentQRCode.tsx             # Dynamic Telebirr & CBE QR generator
    │   └── TelegramKorchaRepo.tsx        # Telegram bot repo connector & guide
    ├── data/
    │   └── sampleProducts.ts             # Featured Ethiopian marketplace products
    ├── services/
    │   ├── pricingEngine.ts              # 1.88x exchange & cargo rate calculations
    │   ├── marketplaceParser.ts          # URL parser for Shein, Temu, AliExpress
    │   └── telegramApiService.ts         # Live Telegram worker alert dispatcher
    └── types/
        └── index.ts                      # Order, Product, and Milestone TypeScript types
```

---

## ✨ Key Features

1. **🛍️ Multi-Marketplace Concierge:** Browse & order from Shein, Temu, and AliExpress.
2. **⏳ Worker-Assisted Flow:** Customers submit links or screenshots and receive a `"ዋጋውን በ5 ደቂቃ ውስጥ አስልተን እናሳውቅዎታለን"` notice with direct worker contact.
3. **💳 25% Advance Payment:** Interactive Telebirr and Commercial Bank of Ethiopia (CBE) QR codes and account details.
4. **📦 "My Orders" Live Tracking:** Customers enter their Ethiopian phone number to look up their order history, deposit verification status, and live 7-stage flight-to-doorstep milestones.
5. **💬 Telegram Concierge:** Direct chat integration with worker support (`@korcha_support`).

---

## 📄 License
ISC
