/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { MarketplaceSearchExplorer } from './components/MarketplaceSearchExplorer';
import { MarketplaceCalculator } from './components/MarketplaceCalculator';
import { TelegramSimulator } from './components/TelegramSimulator';
import { WorkerDispatchDashboard } from './components/WorkerDispatchDashboard';
import { EthioTelecomDeployCenter } from './components/EthioTelecomDeployCenter';
import { BotSettingsModal } from './components/BotSettingsModal';
import { Order, OrderStatus, ParsedProduct } from './types';
import { SAMPLE_PRODUCTS } from './data/sampleProducts';
import { calculateDoorstepPricing } from './services/pricingEngine';
import { sendLiveTelegramWorkerAlert } from './services/telegramApiService';

// Seed initial orders so worker dispatch is immediately demonstrable
const INITIAL_DEMO_ORDERS: Order[] = [
  {
    id: 'ord-101',
    orderNumber: 'KC-849102',
    createdAt: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
    customerName: 'ኤልሳቤጥ ተሾመ (Elshaday T.)',
    customerPhone: '+251911445566',
    customerTelegramUser: '@elshaday_shein',
    customerTelegramId: '48291048',
    deliveryCity: 'አዲስ አበባ',
    deliverySubcity: 'ቦሌ',
    deliveryLandmark: 'ቦሌ መድኃኒዓለም፣ ከአትላስ ሆቴል አጠገብ',
    item: {
      product: SAMPLE_PRODUCTS[0], // Shein Dress
      quantity: 1,
      selectedSize: 'M',
      selectedColor: 'Navy Floral (ሰማያዊ አበባ)',
      pricing: calculateDoorstepPricing(SAMPLE_PRODUCTS[0].originalPriceUsd, 145.50),
    },
    termsAgreed: true,
    termsAgreedAt: new Date(Date.now() - 1000 * 60 * 34).toISOString(),
    depositStatus: 'pending_verification',
    depositMethod: 'telebirr',
    telebirrTxnId: 'TB98410294',
    status: 'pending_deposit',
    workerNotified: true,
  },
  {
    id: 'ord-102',
    orderNumber: 'KC-592019',
    createdAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    customerName: 'ዮናስ ታደሰ (Yonas T.)',
    customerPhone: '+251922889900',
    customerTelegramUser: '@yonas_tech',
    customerTelegramId: '98410294',
    deliveryCity: 'አዲስ አበባ',
    deliverySubcity: 'ቂርቆስ',
    deliveryLandmark: 'ካዛንቺስ፣ ከኢሊሌ ሆቴል ፊት ለፊት',
    item: {
      product: SAMPLE_PRODUCTS[3], // Temu Earbuds
      quantity: 2,
      selectedSize: 'Standard',
      selectedColor: 'Matte Black',
      pricing: calculateDoorstepPricing(SAMPLE_PRODUCTS[3].originalPriceUsd * 2, 145.50),
    },
    termsAgreed: true,
    termsAgreedAt: new Date(Date.now() - 1000 * 60 * 179).toISOString(),
    depositStatus: 'verified',
    depositMethod: 'cbe_birr',
    telebirrTxnId: 'CBE71920482',
    status: 'procured_in_china',
    workerNotified: true,
  },
  {
    id: 'ord-103',
    orderNumber: 'KC-194029',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 14).toISOString(),
    customerName: 'ዳዊት ግርማ (Dawit G.)',
    customerPhone: '+251711223344',
    customerTelegramUser: '@dawit_dev',
    customerTelegramId: '10928491',
    deliveryCity: 'አዲስ አበባ',
    deliverySubcity: 'የካ',
    deliveryLandmark: 'ሲኤምሲ ሚካኤል፣ ፀሐይ ሪል እስቴት መግቢያ',
    item: {
      product: SAMPLE_PRODUCTS[6], // AliExpress Mechanical Keyboard
      quantity: 1,
      selectedSize: 'Compact 75%',
      selectedColor: 'Brown Switch',
      pricing: calculateDoorstepPricing(SAMPLE_PRODUCTS[6].originalPriceUsd, 145.50),
    },
    termsAgreed: true,
    termsAgreedAt: new Date(Date.now() - 1000 * 60 * 60 * 14).toISOString(),
    depositStatus: 'verified',
    depositMethod: 'telebirr',
    telebirrTxnId: 'TB59201948',
    status: 'freight_in_transit',
    workerNotified: true,
  },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<
    'simulator' | 'search' | 'estimation' | 'workers' | 'deploy' | 'settings'
  >('simulator');

  const [selectedProductForEstimation, setSelectedProductForEstimation] =
    useState<ParsedProduct | null>(null);

  const [officialRate, setOfficialRate] = useState<number>(() => {
    const saved = localStorage.getItem('korcha_rate');
    return saved ? parseFloat(saved) : 145.50; // Commercial Bank of Ethiopia floating rate
  });

  const [botToken, setBotToken] = useState<string>(() => {
    return localStorage.getItem('korcha_bot_token') || '';
  });

  const [workerChatId, setWorkerChatId] = useState<string>(() => {
    return localStorage.getItem('korcha_worker_chat_id') || '';
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('korcha_orders');
    return saved ? JSON.parse(saved) : INITIAL_DEMO_ORDERS;
  });

  const [toastNotification, setToastNotification] = useState<string | null>(null);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('korcha_rate', officialRate.toString());
  }, [officialRate]);

  useEffect(() => {
    localStorage.setItem('korcha_bot_token', botToken);
  }, [botToken]);

  useEffect(() => {
    localStorage.setItem('korcha_worker_chat_id', workerChatId);
  }, [workerChatId]);

  useEffect(() => {
    localStorage.setItem('korcha_orders', JSON.stringify(orders));
  }, [orders]);

  const handleNewOrderPlaced = async (newOrder: Order) => {
    setOrders((prev) => [newOrder, ...prev]);
    setToastNotification(
      `🚨 አዲስ ትዕዛዝ ደርሷል: #${newOrder.orderNumber} (ስልክ: ${newOrder.customerPhone}) • የ 25% ክፍያ: ${newOrder.item.pricing.depositAmountEtb.toLocaleString()} ብር`
    );

    setTimeout(() => {
      setToastNotification(null);
    }, 7000);

    // If live bot token & chat ID are configured, forward instant alert to Telegram worker group
    if (botToken && workerChatId) {
      const alertText =
        `🚨 <b>አዲስ የኮርቻ ትዕዛዝ ደርሷል! (NEW ORDER)</b>\n\n` +
        `<b>የትዕዛዝ ቁጥር:</b> #${newOrder.orderNumber}\n` +
        `<b>የደንበኛ ስም:</b> ${newOrder.customerName}\n` +
        `<b>ስልክ ቁጥር:</b> ${newOrder.customerPhone}\n` +
        `<b>አድራሻ / ምልክት:</b> ${newOrder.deliveryCity}፣ ${newOrder.deliverySubcity} (${newOrder.deliveryLandmark})\n` +
        `<b>መድረክ:</b> ${newOrder.item.product.marketplace.toUpperCase()}\n` +
        `<b>እቃ:</b> ${newOrder.item.product.title}\n` +
        `<b>ሊንክ:</b> ${newOrder.item.product.url}\n\n` +
        `💰 <b>ጠቅላላ የበር ላይ ዋጋ:</b> ${newOrder.item.pricing.totalPriceEtb.toLocaleString()} ETB\n` +
        `💵 <b>የ 25% ቅድመ ክፍያ:</b> ${newOrder.item.pricing.depositAmountEtb.toLocaleString()} ETB\n` +
        `📦 <b>ቀሪ 75% ሲደርስ:</b> ${newOrder.item.pricing.codAmountEtb.toLocaleString()} ETB\n` +
        `💳 <b>የክፍያ ዘዴ:</b> ${newOrder.depositMethod || 'ቴሌብር'} (Txn: <code>${newOrder.telebirrTxnId || 'Pending'}</code>)\n\n` +
        `<i>ደንበኛው ደንቦቹን ተስማምቶ የ 25% ክፍያ ፈጽሟል፤ እባክዎን እቃውን ከቻይና ይዘዙ!</i>`;

      await sendLiveTelegramWorkerAlert(botToken, workerChatId, alertText);
    }
  };

  const handleUpdateOrderStatus = (orderId: string, status: OrderStatus, txnId?: string) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
          return {
            ...o,
            status,
            depositStatus: status === 'deposit_verified' ? 'verified' : o.depositStatus,
            telebirrTxnId: txnId || o.telebirrTxnId,
          };
        }
        return o;
      })
    );
  };

  const handleSelectProductForEstimation = (product: ParsedProduct) => {
    setSelectedProductForEstimation(product);
    setActiveTab('estimation');
  };

  const pendingOrdersCount = orders.filter((o) => o.status === 'pending_deposit').length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Toast Notification Bar */}
      {toastNotification && (
        <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-slate-950 px-4 py-2.5 font-bold text-xs sm:text-sm text-center flex items-center justify-center gap-2 shadow-lg animate-bounce sticky top-0 z-50">
          <span>{toastNotification}</span>
          <button
            onClick={() => setActiveTab('workers')}
            className="underline text-slate-950 hover:text-white ml-2 text-xs font-black cursor-pointer"
          >
            ሰራተኞች ገጽ ይመልከቱ →
          </button>
        </div>
      )}

      {/* Main Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        officialRate={officialRate}
        setOfficialRate={setOfficialRate}
        pendingOrdersCount={pendingOrdersCount}
        hasRealBotToken={Boolean(botToken && workerChatId)}
      />

      {/* Tab Views */}
      <main className="flex-1">
        {activeTab === 'search' && (
          <MarketplaceSearchExplorer
            officialRate={officialRate}
            onSelectProductForEstimation={handleSelectProductForEstimation}
          />
        )}

        {activeTab === 'estimation' && (
          <MarketplaceCalculator
            officialRate={officialRate}
            initialProduct={selectedProductForEstimation}
            onOrderCompleted={handleNewOrderPlaced}
          />
        )}

        {activeTab === 'simulator' && (
          <TelegramSimulator
            officialRate={officialRate}
            onNewOrderPlaced={handleNewOrderPlaced}
            botToken={botToken}
            workerChatId={workerChatId}
            onNavigateToSearch={() => setActiveTab('search')}
          />
        )}

        {activeTab === 'workers' && (
          <WorkerDispatchDashboard
            orders={orders}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            botToken={botToken}
            workerChatId={workerChatId}
          />
        )}

        {activeTab === 'deploy' && <EthioTelecomDeployCenter />}

        {activeTab === 'settings' && (
          <BotSettingsModal
            botToken={botToken}
            setBotToken={setBotToken}
            workerChatId={workerChatId}
            setWorkerChatId={setWorkerChatId}
            officialRate={officialRate}
            setOfficialRate={setOfficialRate}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-900/40 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-300">Korcha (ኮርቻ)</span>
            <span>• Cross-Border E-Commerce Concierge for Ethiopia</span>
          </div>
          <div>
            <span>Shein • Temu • AliExpress</span>
            <span className="mx-2">|</span>
            <span>25% ቅድመ ክፍያ በቴሌብር • ቀሪ 75% እቃው በርዎ ሲደርስ</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
