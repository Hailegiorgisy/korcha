# SHEIN Ethiopia - Mobile & Telegram Web App Concierge

Mobile-first e-commerce concierge platform allowing Ethiopian customers to browse Shein with local context, paste any Shein URL for an instant ETB landed-cost calculation, and order with a 25% digital deposit (Telebirr/CBE/M-Pesa) and 75% Cash on Delivery (COD).

## Features

- **Mobile & Telegram Web App UI**: Shein aesthetic, compact cards, discount badges, and smooth navigation.
- **Bilingual Interface**: Quick header toggle between English and Amharic (`EN / አማ`).
- **On-Demand Shein URL Quoter**: Paste any Shein product link to extract metadata and compute the ETB price (USD × 1.50 × 125 ETB rate).
- **Featured Catalog**: Curated selection across Clothes, Electronics, and Cosmetics.
- **Landmark Checkout**: Eliminates street-address requirements in favor of a one-click GPS pin drop, nearest landmark description, and two phone numbers.
- **Split Payment**: Simulated Chapa gateway collecting a 25% digital deposit with 75% Cash on Delivery.
- **Dispatcher Dashboard (`/dispatch`)**: Admin screen with active orders, customer contact info, delivery method, and one-click Google Maps navigation.
- **Backend (ES Modules)**: Express API with calculation endpoints and simulated daily background catalog sync.

## Getting Started

### 1. Frontend
```bash
npm install
npm run dev
```

### 2. Backend
```bash
cd backend
npm install
npm start
```
