# Korcha (ኮርቻ) 🚀

> Ethiopian Cross-Border E-Commerce Concierge, Web App & Telegram Mini App (TMA) for **Shein**, **Temu**, and **AliExpress**.

Korcha provides door-to-door landed price calculations (USD to ETB using the automated **1.88× landed formula**), Telebirr & CBE Birr QR code payment flows, live order tracking, a Telegram Mini App interface, and a back-office Worker Dispatch Portal.

---

## 🌟 Key Features

1. **Dual Interface**:
   - **Modern Web Application / Telegram Mini App (TMA)**: React 19 + Tailwind CSS + Lucide icons. Native TMA viewport expansion, theme detection, and Telegram haptic feedback.
   - **Interactive Telegram Bot**: Built with Telegraf, offering Amharic navigation menus, automated 1.88× landed price quotes, 25% deposit calculation, and instant payment instructions.
2. **Automated Landed Cost Calculator**:
   - `Landed Price (ETB) = Item USD × 1.88 × CBE Exchange Rate`
   - Upfront 25% Telebirr/CBE deposit, 75% Cash-on-Delivery (COD) balance upon doorstep arrival in Addis Ababa.
3. **Live Order Tracking ("My Orders")**:
   - Real-time order progress timeline: `Pending Deposit` → `Ordered in China` → `Air Shipping` → `Customs Clearance` → `Out for Delivery` → `Delivered`.
4. **Worker Dispatch Portal**:
   - Built-in lightweight Express admin endpoint (`/worker-portal`) for staff to update order statuses and dispatch delivery notifications.
5. **Zero-Configuration Production Deployment**:
   - Ready-to-run Ethio Telecom / Ubuntu VPS script (`deploy_ethiotelecom.sh`), PM2 configuration (`ecosystem.config.cjs`), and systemd unit (`korcha.service`).

---

## 📁 Project Structure

```text
├── bot.js                  # Telegram Bot & Express API server (serves TMA, Web & Worker Portal)
├── src/                    # Frontend React 19 SPA source code
│   ├── components/         # UI components (Header, MarketplaceSelector, PriceCalculator, MyOrdersView, etc.)
│   ├── services/           # telegramWebApp, pricingEngine, telegramApiService
│   ├── data/               # Ethiopian banks, sample marketplace items
│   └── App.tsx             # Root application component
├── deploy_ethiotelecom.sh  # Automated setup script for Ethio Telecom / Ubuntu cloud servers
├── ecosystem.config.cjs    # PM2 process manager configuration
├── korcha.service          # Systemd service unit definition
├── .env.example            # Environment variables template
├── package.json            # Scripts and dependencies
└── vite.config.ts          # Vite configuration
```

---

## ⚙️ Environment Variables

Create a `.env` file in the root directory:

```env
# Telegram Bot Configuration
TELEGRAM_BOT_TOKEN="your_bot_father_token_here"
TELEGRAM_WORKER_CHAT_ID="-100xxxxxxxxxx"

# Currency & Rates
EXCHANGE_RATE="145.50"
WORKER_PORT="3001"

# Banking details (Telebirr & CBE)
TELEBIRR_RECEIVER_NUMBER="0911000000"
CBE_ACCOUNT_NUMBER="1000000000000"
CBE_ACCOUNT_NAME="Korcha Delivery Services"

# Telegram Mini App URL (optional, defaults to server host)
TELEGRAM_WEB_APP_URL="https://your-domain.com"
```

---

## 🚀 Getting Started

### Local Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the web frontend development server:
   ```bash
   npm run dev
   ```

3. Start the Telegram Bot & Worker Portal:
   ```bash
   node bot.js
   ```

### Building for Production

Compile the web frontend into `/dist`:
```bash
npm run build
```
When `dist` exists, `bot.js` automatically serves both the Web App and the Telegram Mini App from port `3001`.

---

## 🖥️ Server Deployment (Ethio Telecom Cloud / VPS)

Run the automated deployment script:
```bash
bash deploy_ethiotelecom.sh
```

Or run with PM2:
```bash
pm2 start ecosystem.config.cjs
pm2 save
```
