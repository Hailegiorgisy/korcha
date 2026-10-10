import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Sparkles,
  Smartphone,
  Maximize2,
  Minimize2,
  RefreshCw,
  ShoppingBag,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Clock,
  ArrowRight,
  ShieldCheck,
  MapPin,
  Phone,
  Truck,
  Copy,
  Check,
} from 'lucide-react';
import { TelegramBotMessage, Order, ParsedProduct, Marketplace } from '../types';
import { SAMPLE_PRODUCTS } from '../data/sampleProducts';
import { parseMarketplaceLink } from '../services/marketplaceParser';
import { calculateDoorstepPricing } from '../services/pricingEngine';

interface TelegramSimulatorProps {
  officialRate: number;
  onNewOrderPlaced: (order: Order) => void;
  botToken: string;
  workerChatId: string;
}

export const TelegramSimulator: React.FC<TelegramSimulatorProps> = ({
  officialRate,
  onNewOrderPlaced,
  botToken,
  workerChatId,
}) => {
  const [messages, setMessages] = useState<TelegramBotMessage[]>([]);
  const [inputVal, setInputVal] = useState('');
  const [isPhoneFrame, setIsPhoneFrame] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [awaitingDetailsFor, setAwaitingDetailsFor] = useState<{
    product: ParsedProduct;
    quantity: number;
    size?: string;
    color?: string;
    pricing?: any;
  } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initial welcome message
  useEffect(() => {
    if (messages.length === 0) {
      initWelcome();
    }
  }, [officialRate]);

  const initWelcome = () => {
    const welcomeMsg: TelegramBotMessage = {
      id: 'msg-init-1',
      sender: 'bot',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text:
        `👋 ሰላም! ወደ <b>ኮርቻ (Korcha)</b> የቴሌግራም ቦት እንኳን በደህና መጡ!\n\n` +
        `ኮርቻ ከ <b>Shein</b>፣ <b>Temu</b> እና <b>AliExpress</b> የሚፈልጉትን ማንኛውንም እቃ በታማኝነት ከቻይና አምጥቶ እስከ ደጃፍዎ የሚያደርስ መተግበሪያ ነው።\n\n` +
        `🛍️ <b>እንዴት እንደሚሰሩ:</b>\n` +
        `1. የሚፈልጉትን እቃ ሊንክ ከ Shein፣ Temu ወይም AliExpress ይቅዱ (Copy Link)\n` +
        `2. ሊንኩን እዚህ ቻት ውስጥ ይላኩልን\n` +
        `3. ወዲያውኑ የኢትዮጵያ ብር የበር ላይ ዋጋ በ <b>1.88x ቀመር</b> እናቀርብልዎታለን!\n\n` +
        `💵 <b>ይፋዊ የባንክ ምንዛሬ:</b> 1 USD = ${officialRate.toFixed(2)} ETB\n` +
        `✈️ <b>የማድረሻ ጊዜ:</b> ከ 10 እስከ 18 የስራ ቀናት\n` +
        `💳 <b>ክፍያ:</b> 25% በቴሌብር ቅድመ ክፍያ • ቀሪ 75% እቃው በርዎ ሲደርስ`,
      inlineKeyboard: [
        [
          { text: '👗 Shein ሱቅ', action: 'browse_shein' },
          { text: '⚡ Temu ሱቅ', action: 'browse_temu' },
          { text: '📱 AliExpress', action: 'browse_ali' },
        ],
        [
          { text: '🧮 የዋጋ ማስያ (1.88x)', action: 'calc_info' },
          { text: '📋 ደንቦችና መመሪያዎች', action: 'show_terms' },
        ],
      ],
    };
    setMessages([welcomeMsg]);
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleAction = (action: string, payload?: any) => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (action === 'browse_shein') {
      const sheinSamples = SAMPLE_PRODUCTS.filter((p) => p.marketplace === 'shein');
      setMessages((prev) => [
        ...prev,
        {
          id: `usr-${Date.now()}`,
          sender: 'user',
          timestamp: timeStr,
          text: '👗 Shein ሱቅ',
        },
        {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          timestamp: timeStr,
          text:
            `👗 <b>የ Shein ምርቶች</b>\n\n` +
            `ከዚህ በታች ካሉት የ Shein ምርቶች አንዱን ይምረጡ ወይም የእራስዎን የ Shein ሊንክ እዚህ ቻት ላይ ይላኩልን:`,
          inlineKeyboard: sheinSamples.map((p) => [
            {
              text: `👗 ${p.title.slice(0, 32)}... ($${p.originalPriceUsd})`,
              action: `select_sample_${p.id}`,
            },
          ]),
        },
      ]);
      return;
    }

    if (action === 'browse_temu') {
      const temuSamples = SAMPLE_PRODUCTS.filter((p) => p.marketplace === 'temu');
      setMessages((prev) => [
        ...prev,
        {
          id: `usr-${Date.now()}`,
          sender: 'user',
          timestamp: timeStr,
          text: '⚡ Temu ሱቅ',
        },
        {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          timestamp: timeStr,
          text:
            `⚡ <b>የ Temu ምርቶች</b>\n\n` +
            `ከዚህ በታች ካሉት ታዋቂ የ Temu እቃዎች አንዱን ይምረጡ ወይም የእራስዎን የ Temu ሊንክ ይላኩልን:`,
          inlineKeyboard: temuSamples.map((p) => [
            {
              text: `⚡ ${p.title.slice(0, 32)}... ($${p.originalPriceUsd})`,
              action: `select_sample_${p.id}`,
            },
          ]),
        },
      ]);
      return;
    }

    if (action === 'browse_ali') {
      const aliSamples = SAMPLE_PRODUCTS.filter((p) => p.marketplace === 'aliexpress');
      setMessages((prev) => [
        ...prev,
        {
          id: `usr-${Date.now()}`,
          sender: 'user',
          timestamp: timeStr,
          text: '📱 AliExpress ሱቅ',
        },
        {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          timestamp: timeStr,
          text:
            `📱 <b>የ AliExpress ምርቶች</b>\n\n` +
            `ከዚህ በታች ካሉት የ AliExpress ቴክኖሎጂ እና ፋሽን እቃዎች አንዱን ይምረጡ ወይም ሊንክ ይላኩልን:`,
          inlineKeyboard: aliSamples.map((p) => [
            {
              text: `📱 ${p.title.slice(0, 32)}... ($${p.originalPriceUsd})`,
              action: `select_sample_${p.id}`,
            },
          ]),
        },
      ]);
      return;
    }

    if (action === 'show_terms') {
      setMessages((prev) => [
        ...prev,
        {
          id: `usr-${Date.now()}`,
          sender: 'user',
          timestamp: timeStr,
          text: '📋 ደንቦችና መመሪያዎች',
        },
        {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          timestamp: timeStr,
          text:
            `📜 <b>የኮርቻ (Korcha) አገልግሎት ደንቦችና መመሪያዎች</b>\n\n` +
            `1. <b>የዋጋ ቀመር:</b> የበር ላይ ዋጋ = [የዋናው እቃ ዶላር × 1.88] × ይፋዊ የባንክ ምንዛሬ። ይህ የአየር ጭነት፣ ቦሌ ጉምሩክ ቀረጥ፣ እና የቤት ለቤት ማድረሻን ያጠቃልላል።\n` +
            `2. <b>ቅድመ ክፍያ:</b> እቃው ከቻይና እንዲገዛና ወደ ቦሌ እንዲላክ 25% በቴሌብር ይከፈላል።\n` +
            `3. <b>ቀሪ ክፍያ (75%):</b> እቃው አዲስ አበባ በርዎ ላይ ደርሶ ሲፈትሹ በጥሬ ገንዘብ ወይም በቴሌብር ይከፈላል።\n` +
            `4. <b>የማድረሻ ጊዜ:</b> ክፍያው ከተረጋገጠበት ቀን ጀምሮ ከ 10 እስከ 18 የስራ ቀናት።\n` +
            `5. <b>ዋስትና:</b> እቃው ከተበላሸ ወይም በፋብሪካ ስህተት የተሳሳተ ከሆነ ሙሉ ተመላሽ ዋስትና አለን።`,
          inlineKeyboard: [
            [
              { text: '🛍️ እቃ መርምር / አስላ', action: 'browse_shein' },
            ],
          ],
        },
      ]);
      return;
    }

    if (action === 'calc_info') {
      setMessages((prev) => [
        ...prev,
        {
          id: `usr-${Date.now()}`,
          sender: 'user',
          timestamp: timeStr,
          text: '🧮 የዋጋ ማስያ (1.88x)',
        },
        {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          timestamp: timeStr,
          text:
            `🧮 <b>የኮርቻ 1.88x ስሌት እንዴት ይሰራል?</b>\n\n` +
            `ምሳሌ: አንድ $20 ዶላር የሚያወጣ እቃ በ Shein ወይም Temu ላይ ቢያዩ:\n` +
            `• የ 1.88x ብዜት = $20 × 1.88 = <b>$37.60 USD</b> (ጭነት + ጉምሩክ ያካተተ)\n` +
            `• በይፋዊ ምንዛሬ (${officialRate} ብር) = <b>${Math.round(20 * 1.88 * officialRate).toLocaleString()} ብር</b>\n` +
            `• የ 25% ቴሌብር ቅድመ ክፍያ = <b>${Math.round(20 * 1.88 * officialRate * 0.25).toLocaleString()} ብር</b>\n` +
            `• ቀሪ 75% ሲደርስ = <b>${Math.round(20 * 1.88 * officialRate * 0.75).toLocaleString()} ብር</b>\n\n` +
            `የሚፈልጉትን እቃ ዋጋ ወይም ሊንክ አሁን ይላኩልን!`,
        },
      ]);
      return;
    }

    if (action.startsWith('select_sample_')) {
      const sampleId = action.replace('select_sample_', '');
      const product = SAMPLE_PRODUCTS.find((p) => p.id === sampleId);
      if (product) {
        processProductQuote(product);
      }
      return;
    }

    if (action === 'agree_and_order' && payload) {
      handleAgreeAndOrder(payload);
      return;
    }
  };

  const processProductQuote = (product: ParsedProduct) => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const pricing = calculateDoorstepPricing(product.originalPriceUsd, officialRate);

    const orderItem = {
      product,
      quantity: 1,
      selectedSize: product.availableSizes[0] || 'Standard',
      selectedColor: product.availableColors[0] || 'Default',
      pricing,
    };

    const quoteMsg: TelegramBotMessage = {
      id: `bot-quote-${Date.now()}`,
      sender: 'bot',
      timestamp: timeStr,
      photoUrl: product.imageUrl,
      text:
        `📦 <b>${product.title}</b>\n` +
        `<i>${product.titleAmharic || ''}</i>\n\n` +
        `🏬 <b>የገበያ ቦታ:</b> ${product.marketplace.toUpperCase()} | <b>ምድብ:</b> ${product.category}\n` +
        `💵 <b>ዋናው ዋጋ:</b> $${pricing.originalPriceUsd.toFixed(2)} USD\n\n` +
        `━━━━━━━━━━━━━━━━━━━━\n` +
        `💰 <b>ጠቅላላ የበር ላይ ዋጋ: ${pricing.totalPriceEtb.toLocaleString()} ብር (ETB)</b>\n` +
        `━━━━━━━━━━━━━━━━━━━━\n\n` +
        `🔹 <b>አሁን የሚከፈል 25% ቅድመ ክፍያ:</b> <b>${pricing.depositAmountEtb.toLocaleString()} ብር</b> (በቴሌብር/CBE)\n` +
        `🔹 <b>ቀሪ 75% እቃው በርዎ ላይ ሲደርስ:</b> ${pricing.codAmountEtb.toLocaleString()} ብር\n` +
        `✈️ <b>የማድረሻ ጊዜ:</b> 10 - 18 የስራ ቀናት\n\n` +
        `በዋጋው ከተስማሙ '✅ ደንቦቹን ተስማምቻለሁ — እዘዝ' የሚለውን ይጫኑ:`,
      quoteCard: orderItem,
      inlineKeyboard: [
        [
          {
            text: '✅ ደንቦቹን ተስማምቻለሁ — እዘዝ (Agree & Order)',
            action: 'agree_and_order',
            style: 'success',
          },
        ],
        [
          { text: '👗 Shein', action: 'browse_shein' },
          { text: '⚡ Temu', action: 'browse_temu' },
          { text: '📱 AliExpress', action: 'browse_ali' },
        ],
      ],
    };

    setMessages((prev) => [...prev, quoteMsg]);
  };

  const handleAgreeAndOrder = (item: any) => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setAwaitingDetailsFor(item);

    setMessages((prev) => [
      ...prev,
      {
        id: `usr-agree-${Date.now()}`,
        sender: 'user',
        timestamp: timeStr,
        text: '✅ ደንቦቹን ተስማምቻለሁ — እዘዝ',
      },
      {
        id: `bot-prompt-details-${Date.now()}`,
        sender: 'bot',
        timestamp: timeStr,
        text:
          `📝 <b>ትዕዛዝዎን ለማጠናቀቅ የማድረሻ መረጃዎን ያስገቡ:</b>\n\n` +
          `እባክዎ <b>ስልክ ቁጥርዎን</b> እና <b>የመኖሪያ አድራሻዎን (ክፍለ ከተማ፣ ምልክት)</b> ይላኩልን:\n` +
          `<i>ምሳሌ: 0911223344 ቦሌ መድኃኒዓለም፣ ከአብሲኒያ ባንክ ጀርባ</i>\n\n` +
          `ወይም ከታች ካሉት የሙከራ አድራሻዎች አንዱን ይጫኑ:`,
        inlineKeyboard: [
          [
            { text: '📍 0911234567 • ቦሌ መድኃኒዓለም', action: 'quick_addr_bole' },
          ],
          [
            { text: '📍 0922345678 • ፒያሳ ቴሌ', action: 'quick_addr_piassa' },
          ],
          [
            { text: '📍 0711998877 • ሲኤምሲ ሚካኤል', action: 'quick_addr_cmc' },
          ],
        ],
      },
    ]);
  };

  const handleQuickAddress = (phone: string, city: string, subcity: string, landmark: string) => {
    if (!awaitingDetailsFor) return;

    submitFinalOrder({
      customerName: 'ደውል ደንበኛ (Abebe K.)',
      customerPhone: phone,
      deliveryCity: city,
      deliverySubcity: subcity,
      deliveryLandmark: landmark,
    });
  };

  const submitFinalOrder = (customerDetails: {
    customerName: string;
    customerPhone: string;
    deliveryCity: string;
    deliverySubcity: string;
    deliveryLandmark: string;
  }) => {
    if (!awaitingDetailsFor) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const orderNumber = `KC-${Math.floor(100000 + Math.random() * 900000)}`;

    const newOrder: Order = {
      id: `order-${Date.now()}`,
      orderNumber,
      createdAt: new Date().toISOString(),
      customerName: customerDetails.customerName,
      customerPhone: customerDetails.customerPhone,
      customerTelegramUser: '@ethio_customer',
      customerTelegramId: '89104829',
      deliveryCity: customerDetails.deliveryCity,
      deliverySubcity: customerDetails.deliverySubcity,
      deliveryLandmark: customerDetails.deliveryLandmark,
      item: {
        product: awaitingDetailsFor.product,
        quantity: awaitingDetailsFor.quantity,
        selectedSize: awaitingDetailsFor.size || 'M',
        selectedColor: awaitingDetailsFor.color || 'Original',
        pricing: awaitingDetailsFor.pricing || calculateDoorstepPricing(awaitingDetailsFor.product.originalPriceUsd, officialRate),
      },
      termsAgreed: true,
      termsAgreedAt: new Date().toISOString(),
      depositStatus: 'pending_verification',
      status: 'pending_deposit',
      workerNotified: true,
    };

    onNewOrderPlaced(newOrder);
    setAwaitingDetailsFor(null);

    const confirmationMsg: TelegramBotMessage = {
      id: `bot-conf-${Date.now()}`,
      sender: 'bot',
      timestamp: timeStr,
      text:
        `🎉 <b>እንኳን ደስ አልዎት! ትዕዛዝዎ #${orderNumber} ተመዝግቧል!</b>\n\n` +
        `📦 <b>እቃ:</b> ${newOrder.item.product.title}\n` +
        `🏬 <b>መድረክ:</b> ${newOrder.item.product.marketplace.toUpperCase()}\n` +
        `💰 <b>ጠቅላላ የበር ላይ ዋጋ:</b> ${newOrder.item.pricing.totalPriceEtb.toLocaleString()} ብር\n` +
        `💵 <b>የ 25% ቅድመ ክፍያ:</b> <b>${newOrder.item.pricing.depositAmountEtb.toLocaleString()} ብር</b>\n` +
        `📦 <b>ቀሪ 75% ሲደርስ:</b> ${newOrder.item.pricing.codAmountEtb.toLocaleString()} ብር\n\n` +
        `📍 <b>የማድረሻ አድራሻ:</b> ${newOrder.deliveryCity}፣ ${newOrder.deliverySubcity} (${newOrder.deliveryLandmark})\n` +
        `📞 <b>ስልክ:</b> ${newOrder.customerPhone}\n\n` +
        `━━━━━━━━━━━━━━━━━━━━\n` +
        `📲 <b>የቴሌብር ክፍያ መመሪያ:</b>\n` +
        `እባክዎ የ 25% ቅድመ ክፍያውን (${newOrder.item.pricing.depositAmountEtb.toLocaleString()} ብር) በቴሌብር ወደዚህ ቁጥር ያስገቡ:\n` +
        `📱 <b>+251911234567</b> (ኮርቻ ሎጂስቲክስ)\n` +
        `━━━━━━━━━━━━━━━━━━━━\n\n` +
        `🚨 <b>የኮርቻ ሰራተኞች ማሳሰቢያ ተልኳል:</b>\n` +
        `ትዕዛዝዎ ወዲያውኑ ለኮርቻ ሰራተኞች ቴሌግራም ግሩፕ ደርሷል! ክፍያዎ እንደተረጋገጠ እቃው ከቻይና በቀጥታ ይታዘዛል።`,
      orderConfirmation: newOrder,
      inlineKeyboard: [
        [
          { text: '📋 ሌላ እቃ መርምር', action: 'browse_shein' },
          { text: '📞 የደንበኞች አገልግሎት', action: 'show_terms' },
        ],
      ],
    };

    setMessages((prev) => [...prev, confirmationMsg]);
  };

  const handleSendMessage = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputVal.trim()) return;

    const text = inputVal.trim();
    setInputVal('');
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Add user message
    setMessages((prev) => [
      ...prev,
      {
        id: `usr-${Date.now()}`,
        sender: 'user',
        timestamp: timeStr,
        text,
      },
    ]);

    // If awaiting details:
    if (awaitingDetailsFor) {
      submitFinalOrder({
        customerName: 'የኮርቻ ደንበኛ',
        customerPhone: text.match(/09\d{8}|07\d{8}|\+251\d{9}/)?.[0] || '0911234567',
        deliveryCity: 'አዲስ አበባ',
        deliverySubcity: 'ቦሌ',
        deliveryLandmark: text,
      });
      return;
    }

    // Process command or link
    if (text === '/start') {
      setTimeout(() => initWelcome(), 300);
      return;
    }

    if (text === '/terms' || text === 'ደንቦች') {
      setTimeout(() => handleAction('show_terms'), 300);
      return;
    }

    // Parse product link or price
    setTimeout(() => {
      const parsedProduct = parseMarketplaceLink(text);
      processProductQuote(parsedProduct);
    }, 400);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 max-w-7xl mx-auto px-4 py-6">
      {/* Left Column: Telegram Simulator */}
      <div className={`flex-1 flex flex-col items-center justify-center transition-all ${isPhoneFrame ? 'py-2' : ''}`}>
        <div
          className={`w-full ${
            isPhoneFrame
              ? 'max-w-[420px] rounded-[38px] border-[8px] border-slate-800 shadow-2xl shadow-amber-500/10'
              : 'max-w-3xl rounded-2xl border border-slate-800 shadow-xl'
          } bg-[#0e1621] flex flex-col h-[740px] overflow-hidden`}
        >
          {/* Telegram Header */}
          <div className="bg-[#17212b] border-b border-slate-800 px-4 py-3 flex items-center justify-between text-white select-none">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-500 to-emerald-600 flex items-center justify-center font-bold text-white shadow-md text-lg">
                  ኮ
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-[#17212b]" />
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-sm tracking-wide text-white">Korcha Bot (ኮርቻ)</h3>
                  <span className="text-[10px] px-1 bg-amber-500/20 text-amber-300 font-semibold rounded border border-amber-500/30">
                    BOT
                  </span>
                  <span className="text-xs">🇪🇹</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Shein • Temu • AliExpress Concierge
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsPhoneFrame(!isPhoneFrame)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title={isPhoneFrame ? 'Expand View' : 'Phone Frame View'}
              >
                {isPhoneFrame ? <Maximize2 className="w-4 h-4" /> : <Smartphone className="w-4 h-4" />}
              </button>
              <button
                onClick={initWelcome}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title="Restart Chat (/start)"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Telegram Chat Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-[#0e1621] via-[#111923] to-[#0e1621]">
            {messages.map((msg) => {
              const isBot = msg.sender === 'bot';

              return (
                <div key={msg.id} className={`flex flex-col ${isBot ? 'items-start' : 'items-end'}`}>
                  <div
                    className={`max-w-[88%] sm:max-w-[80%] rounded-2xl p-3.5 shadow-md ${
                      isBot
                        ? 'bg-[#182533] text-slate-100 rounded-tl-sm border border-slate-800/80'
                        : 'bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-tr-sm shadow-amber-600/20'
                    }`}
                  >
                    {/* Optional Product Photo in Bot Message */}
                    {msg.photoUrl && (
                      <div className="relative mb-3 rounded-xl overflow-hidden border border-slate-700/60 bg-slate-900 group">
                        <img
                          src={msg.photoUrl}
                          alt="Product preview"
                          className="w-full h-44 object-cover object-center group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-slate-950/80 backdrop-blur-sm text-[10px] font-bold text-amber-300 uppercase tracking-wider">
                          {msg.quoteCard?.product.marketplace || 'Chinese Marketplace'}
                        </div>
                      </div>
                    )}

                    {/* Message Body */}
                    <div
                      className="text-xs sm:text-sm leading-relaxed whitespace-pre-line"
                      dangerouslySetInnerHTML={{ __html: msg.text }}
                    />

                    {/* Timestamp */}
                    <div className="flex items-center justify-end gap-1 mt-1.5 text-[10px] text-slate-400">
                      <span>{msg.timestamp}</span>
                      {!isBot && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                    </div>
                  </div>

                  {/* Inline Keyboards */}
                  {msg.inlineKeyboard && (
                    <div className="mt-2 w-full max-w-[88%] sm:max-w-[80%] flex flex-col gap-1.5">
                      {msg.inlineKeyboard.map((row, rIdx) => (
                        <div key={rIdx} className="flex flex-wrap gap-1.5">
                          {row.map((btn, bIdx) => (
                            <button
                              key={bIdx}
                              onClick={() => {
                                if (btn.action === 'agree_and_order' && msg.quoteCard) {
                                  handleAction(btn.action, msg.quoteCard);
                                } else if (btn.action === 'quick_addr_bole') {
                                  handleQuickAddress('0911234567', 'አዲስ አበባ', 'ቦሌ', 'ቦሌ መድኃኒዓለም ከአብሲኒያ ባንክ ጀርባ');
                                } else if (btn.action === 'quick_addr_piassa') {
                                  handleQuickAddress('0922345678', 'አዲስ አበባ', 'አራዳ', 'ፒያሳ ቴሌ አጠገብ');
                                } else if (btn.action === 'quick_addr_cmc') {
                                  handleQuickAddress('0711998877', 'አዲስ አበባ', 'የካ', 'ሲኤምሲ ሚካኤል ኖህ ሪል እስቴት');
                                } else {
                                  handleAction(btn.action);
                                }
                              }}
                              className={`flex-1 min-w-[120px] py-2 px-3 rounded-lg text-xs font-semibold text-center transition-all shadow-sm ${
                                btn.style === 'success'
                                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-emerald-900/30'
                                  : 'bg-[#242f3d] hover:bg-[#2b3749] text-sky-400 border border-slate-700/60'
                              }`}
                            >
                              {btn.text}
                            </button>
                          ))}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Command Suggestions Chips */}
          <div className="bg-[#17212b]/80 border-t border-slate-800/80 px-3 py-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <span className="text-[10px] text-slate-400 font-medium shrink-0 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" /> ፈጣን:
            </span>
            <button
              onClick={() => handleAction('browse_shein')}
              className="text-[11px] whitespace-nowrap px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/60 transition-colors"
            >
              👗 Shein Dress ($16.50)
            </button>
            <button
              onClick={() => handleAction('browse_temu')}
              className="text-[11px] whitespace-nowrap px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/60 transition-colors"
            >
              ⚡ Temu Earbuds ($14.99)
            </button>
            <button
              onClick={() => handleAction('browse_ali')}
              className="text-[11px] whitespace-nowrap px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/60 transition-colors"
            >
              📱 AliExpress Keyboard ($34.20)
            </button>
            <button
              onClick={() => handleAction('show_terms')}
              className="text-[11px] whitespace-nowrap px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/60 transition-colors"
            >
              📋 ደንቦች (Terms)
            </button>
          </div>

          {/* Input Bar */}
          <form
            onSubmit={handleSendMessage}
            className="bg-[#17212b] border-t border-slate-800 p-2.5 flex items-center gap-2"
          >
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="Paste Shein/Temu/Ali link or type $25..."
              className="flex-1 bg-[#242f3d] text-white text-xs sm:text-sm placeholder-slate-400 px-3.5 py-2.5 rounded-xl border border-slate-700 focus:outline-none focus:border-amber-500"
            />
            <button
              type="submit"
              disabled={!inputVal.trim()}
              className="w-10 h-10 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:hover:bg-amber-500 text-slate-950 font-bold flex items-center justify-center transition-all shadow-md shadow-amber-500/20"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      {/* Right Column: Interactive Bot Guide & Ethiopian Workflow */}
      <div className="w-full lg:w-96 flex flex-col gap-5">
        {/* Core Formula Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-center gap-2 mb-3">
            <span className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <ShoppingBag className="w-4 h-4" />
            </span>
            <div>
              <h4 className="text-sm font-bold text-white">የኮርቻ 1.88x የዋጋ ቀመር</h4>
              <p className="text-xs text-slate-400">Landed Ethiopian Birr Estimator</p>
            </div>
          </div>

          <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800/80 mb-3 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">የእቃው ዶላር (USD Price):</span>
              <span className="font-semibold text-white">Original Price</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">የኮርቻ ብዜት (Multiplier):</span>
              <span className="font-bold text-amber-400">× 1.88</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">ይፋዊ ምንዛሬ (CBE/NBE):</span>
              <span className="font-semibold text-emerald-400">× {officialRate} ETB</span>
            </div>
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs font-bold">
              <span className="text-slate-300">ጠቅላላ የበር ላይ ዋጋ:</span>
              <span className="text-amber-400">USD × 1.88 × {officialRate}</span>
            </div>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            ይህ ቀመር የአየር ጭነት (Air Cargo Bole)، የጉምሩክ ቀረጥ እና በአዲስ አበባና ክልሎች የቤት ለቤት ማድረሻን በሙሉ ያጠቃልላል።
          </p>
        </div>

        {/* 3 Chinese Marketplaces Supported */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
            <Truck className="w-4 h-4 text-emerald-400" />
            3ቱ የሚደገፉ የቻይና የገበያ ቦታዎች
          </h4>

          <div className="space-y-2.5">
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-lg bg-pink-500/20 text-pink-400 flex items-center justify-center font-bold text-xs">
                  S
                </span>
                <div>
                  <h5 className="text-xs font-bold text-white">Shein (ሼይን)</h5>
                  <p className="text-[11px] text-slate-400">ፋሽን፣ የሴቶች ቀሚስ፣ ጫማ፣ ጌጣጌጥ</p>
                </div>
              </div>
              <button
                onClick={() => handleAction('browse_shein')}
                className="px-2 py-1 text-[11px] bg-slate-800 hover:bg-slate-700 text-sky-400 rounded-lg transition-colors"
              >
                ሞክር
              </button>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-lg bg-orange-500/20 text-orange-400 flex items-center justify-center font-bold text-xs">
                  T
                </span>
                <div>
                  <h5 className="text-xs font-bold text-white">Temu (ቴሙ)</h5>
                  <p className="text-[11px] text-slate-400">ኤሌክትሮኒክስ፣ የኩሽናና የቤት እቃዎች</p>
                </div>
              </div>
              <button
                onClick={() => handleAction('browse_temu')}
                className="px-2 py-1 text-[11px] bg-slate-800 hover:bg-slate-700 text-sky-400 rounded-lg transition-colors"
              >
                ሞክር
              </button>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-lg bg-red-500/20 text-red-400 flex items-center justify-center font-bold text-xs">
                  A
                </span>
                <div>
                  <h5 className="text-xs font-bold text-white">AliExpress (አሊኤክስፕረስ)</h5>
                  <p className="text-[11px] text-slate-400">ቴክኖሎጂ፣ ኮምፒውተር፣ ሰዓትና ጋጄቶች</p>
                </div>
              </div>
              <button
                onClick={() => handleAction('browse_ali')}
                className="px-2 py-1 text-[11px] bg-slate-800 hover:bg-slate-700 text-sky-400 rounded-lg transition-colors"
              >
                ሞክር
              </button>
            </div>
          </div>
        </div>

        {/* Worker Dispatch Status Preview */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              የሰራተኞች ቴሌግራም ግሩፕ
            </h4>
            <span className="px-2 py-0.5 text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded font-semibold">
              Live Feed
            </span>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed mb-3">
            ደንበኛው ደንቦቹን ተስማምቶ ትዕዛዙን እንዳረጋገጠ ወዲያውኑ የትዕዛዙ መረጃ፣ ስልክ ቁጥር እና የመኖሪያ ምልክት ለኮርቻ ሰራተኞች በቴሌግራም ይላካል!
          </p>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-[11px] text-slate-300 font-mono">
            <div className="text-amber-400 font-bold mb-1">🚨 [ወዲያውኑ የሚላክ ማሳሰቢያ]:</div>
            <div>• የትዕዛዝ ቁጥር: #KC-XXXXXX</div>
            <div>• ስልክ: 0911234567</div>
            <div>• አድራሻ: ቦሌ መድኃኒዓለም</div>
            <div>• 25% ቴሌብር ቅድመ ክፍያ: በመጠባበቅ ላይ</div>
          </div>
        </div>
      </div>
    </div>
  );
};
