# Korcha (ኮርቻ) — Ethiopian Cross-Border E-Commerce Concierge Platform (v5.2)

Korcha is an end-to-end e-commerce concierge platform built for Ethiopian shoppers to order products from international online stores (Shein, AliExpress, Temu, and other global stores), receive automated doorstep price calculations in Ethiopian Birr (ETB), pay a 25% advance deposit via Telebirr or CBE, and receive verified doorstep delivery in Addis Ababa and across Ethiopia in 10-14 days.

---

## 🌟 Frontpage & Customer Experience

### 1. Amharic Frontpage Greeting & 3 Simple Steps
> **"ውድ ደንበኛችን እንኳን ወደ ኮርቻ መጡ። በኮርቻ በመጠቀም ከቻይና እቃዎችን ማስመጣት ይችላሉ። 3 ሂደቶችን ብቻ ይጠቀሙ:**
> 1. **የሚፈልጉትን ዕቃ ከተለያዩ ቦታዎች ይምረጡ**
> 2. **የመረጡትን ዕቃ ሊንክ ወይንም ፎቶ (screenshot) ወደ መተግበሪያው ያስገቡ**
> 3. **መተግበሪያው ቤትዎ ሲደርስ የሚከፍሉትን የዕቃውን ዋጋ ሲያስቀምጥልዎት 25% ዋጋ በመክፈል ይዘዙን። ዕቃው ከ10 እስከ 14 ባለው ቀናት ውስጥ እጅዎ ይገባል። ቤትዎ ሲደርስ ቀሪዎን 75% ይከፍላሉ።**
> **እገዛ ከፈለጉ እኛን ያናግሩን። የፈለጉትን ይሸምቱ። መልካም ገበያ።"**

### 2. Attractive Visual Experience
- **🔗 ሊንክ ለሊንክ (Link for Link):** Real product previews with photos, 1-click test links, instant marketplace link parsing.
- **📸 ስክሪንሾት ለስክሪንሾት (Screenshot for Screenshot):** Drag-and-drop screenshot uploads or sample photo cards.
- **🔍 Smart Cheapest-Market Benchmarking:** When a customer sends a product screenshot (from any app or storefront), the scraper detects the item category, searches and reviews equivalent products on the **cheapest market (usually Shein)**, and calculates the door price based on Shein rather than relying on an inflated price shown in the screenshot!

---

## 💰 Doorstep Pricing Formula

1. **HKD Exchange Rate:** Converted using HKD to ETB exchange rate (`~30 ETB per HKD`, 1 USD ≈ 7.8 HKD)
2. **Air Cargo Freight:** `1,000 ETB per 1 kg` (Size limit: max `50cm x 50cm`)
3. **Supplier Markup:** `+27%`
4. **Doorstep Delivery Fee:** `+54%`
5. **Deposit Split:**
   - **25% Upfront Pre-Payment:** Rounded to the nearest `100 ETB` (via Telebirr or CBE Bank)
   - **75% Cash on Delivery (COD):** Paid upon physical doorstep handover (10-14 days)

---

## 📞 Support & Worker Contact Addresses

Configure in `.env`:
```env
# 1. Telegram 1-on-1 customer support handle (without @)
WORKER_TELEGRAM_USERNAME="korcha_support"

# 2. Private Telegram group/channel where orders are dispatched to workers
TELEGRAM_WORKER_CHAT_ID="-100xxxxxxxxxx"

# 3. Customer payment accounts
TELEBIRR_PHONE="+251911234567"
CBE_ACCOUNT="1000123456789"
```

---

## 📁 Repository Structure

```
korcha/
├── backend/                  # Express MVC backend API
│   ├── config/               # Pricing & notification configuration
│   ├── controllers/          # Quote, order, telebirr controllers
│   ├── models/               # Order, Quote, Product models
│   ├── routes/               # API routes (/api/quotes, /api/orders, etc.)
│   ├── services/             # Pricing & Shein parser services
│   └── server.js             # Production entry point & static SPA host
├── frontend/                 # React 19 + TypeScript + Vite UI
│   ├── src/
│   │   ├── components/       # TelegramSimulator, Header, PaymentQRCode, etc.
│   │   ├── data/             # Sample products & deployment guides
│   │   ├── services/         # PricingEngine & MarketplaceParser
│   │   └── types/            # TypeScript interfaces
│   └── dist/                 # Production pre-built assets
├── bot.js                    # Standalone Telegram Bot daemon (Telegraf)
├── scraper.py                # Python marketplace & screenshot scraper
├── deploy_ethiotelecom.sh    # 1-Click Ethio Telecom deployment script
├── ecosystem.config.cjs      # PM2 process manager configuration
└── korcha.service            # Systemd service unit for Linux
```

---

## 🚀 Running & Deployment

### Quick Start:
```bash
# 1. Install dependencies
npm run install:all

# 2. Start the production backend server & static web app
npm start

# 3. Start the Telegram Bot daemon (optional, requires bot token in .env)
node bot.js
```

### Ethio Telecom VPS / Linux Deployment:
Run the automated deployment script on your Linux server:
```bash
bash deploy_ethiotelecom.sh
```
This sets up Node.js, PM2, Python3 dependencies, builds the frontend, and enables automatic restart via systemd.
