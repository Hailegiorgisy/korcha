# Korcha (ኮርቻ) 🚀

Ethiopian cross-border shopping concierge for Shein, Temu, and AliExpress.

Korcha helps customers estimate landed prices, track orders, and complete Telegram-first checkout flows with a simplified worker workflow.

## What this project does

- Calculates landed-doorstep pricing in ETB for marketplace products
- Supports Telegram bot interactions and a Telegram Mini App flow
- Lets customers track order progress and monitor the current order list
- Provides a worker portal and pricing workflow for staff operations
- Includes a simple Vite + React frontend with a Node/Express backend

## Stack

- Frontend: React 19 + Vite + TypeScript + Tailwind CSS
- Backend: Node.js + Express
- Bot layer: Telegraf
- Integrations: Telegram WebApp, QR payment flow, worker alerts

## Project structure

```text
.
├── bot.js                    # Telegram bot and server entry point
├── server.js                 # Lightweight HTTP server
├── scraper.py                # Product scraping helper
├── public/                  # Static public assets
├── src/                     # React frontend source
│   ├── components/          # Reusable UI blocks
│   ├── data/                # Sample data and catalogs
│   ├── services/            # Pricing, Telegram, and parsing helpers
│   ├── App.tsx              # Main app container
│   ├── main.tsx             # App bootstrap
│   └── index.css            # Shared styles
├── .env.example             # Environment variable template
├── deploy_ethiotelecom.sh   # VPS deployment script
├── ecosystem.config.cjs     # PM2 config
├── korcha.service           # Systemd service
├── package.json             # Scripts and dependencies
├── tsconfig.json            # TypeScript configuration
├── vite.config.ts          # Vite configuration
├── README.md                # Project documentation
└── .gitignore
```

## Environment variables

Create a `.env` file in the project root with values like:

```env
TELEGRAM_BOT_TOKEN="your_bot_father_token_here"
TELEGRAM_WORKER_CHAT_ID="-100xxxxxxxxxx"
EXCHANGE_RATE="145.50"
WORKER_PORT="3001"
TELEBIRR_RECEIVER_NUMBER="0911000000"
CBE_ACCOUNT_NUMBER="1000000000000"
CBE_ACCOUNT_NAME="Korcha Delivery Services"
TELEGRAM_WEB_APP_URL="https://your-domain.com"
```

## Local development

1. Install dependencies:

```bash
npm install
```

2. Start the frontend app:

```bash
npm run dev
```

3. Start the bot/server:

```bash
node bot.js
```

## Production build

```bash
npm run build
```

The built frontend is served by the Node app when present, and the bot/worker flow can run behind the included production config.

## Deployment

For a VPS setup, use the included script:

```bash
bash deploy_ethiotelecom.sh
```

Or run with PM2:

```bash
pm2 start ecosystem.config.cjs
pm2 save
```

## Notes

- The project is designed for a Telegram-first user flow and a local web experience.
- The default pricing logic is intentionally opinionated and can be tuned through the shared pricing engine.
- This repo is best suited for a small internal ops or storefront workflow.































