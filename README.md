# Korcha (ኮርቻ) — Shein Ethiopia Cross-Border Concierge

A mobile & Telegram Web App e-commerce platform that enables shoppers in Addis Ababa, Ethiopia to seamlessly browse, quote, and import items from Shein.com.

## Core Features (v2.0 Revision)
- **Branding**: Korcha (ኮርቻ) — local Ethiopian branding with English and Amharic interface (`EN / አማ`).
- **Floating Exchange Rate**: Dynamic 188.0 ETB per USD base calculation.
- **50% Landed Cost Markup**: Covers consolidated air cargo, customs clearance buffer, and platform margin.
- **ETB-Only Display**: Clean, customer-facing pricing with zero confusing USD labels.
- **500+ Visible Products**: Fast-fashion catalog across Clothes (250), Electronics (150), and Cosmetics (100) with category filters, search, and pagination.
- **Shein Variant Selection**: Tap any product to view details, photos, and a direct button to "Choose Size & Color on SHEIN" before adding to bag.
- **Journey A (Quote Request Flow)**: Dedicated tab to submit custom Shein links with size, color, and procurement notes.
- **Telebirr Linkage**: Integrated receiver phone number, USSD transfer guidance (`*127#`), and transaction ID verification.
- **Landmark Checkout**: Browser Geolocation GPS pin drop, nearest landmark description, two active phone numbers, and delivery method selection.
- **Strict MVC Architecture**: Structured backend with distinct Models, Views/Routes, Controllers, and Services.
- **Dispatcher Dashboard**: Admin `/dispatch` view with customer contact info, delivery landmark, and one-click Google Maps pin navigation.

## Architecture

```
korcha-project/
├── backend/                  # Strict MVC Express Application
│   ├── config/pricingConfig.js
│   ├── models/               # ProductModel, OrderModel, QuoteModel
│   ├── controllers/          # catalogController, quoteController, orderController, telebirrController
│   ├── routes/               # catalogRoutes, quoteRoutes, orderRoutes, telebirrRoutes
│   ├── services/             # pricingService, sheinParserService
│   └── server.js
└── frontend/                 # Telegram Web App / Mobile React Vite Frontend
    ├── src/
    │   ├── components/       # Header, Catalog (500+), DetailModal, QuoteView, Cart, Landmark, Payment, Dispatch
    │   ├── data/             # catalog500.json
    │   ├── types/
    │   ├── utils/            # translations (EN/AM), kvStore
    │   ├── App.tsx
    │   └── App.css
    └── package.json
```

## Running the Application

### 1. Backend Server
```bash
cd backend
npm install
npm start
# Runs on http://localhost:5000
```

### 2. Frontend App
```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:5173
```
