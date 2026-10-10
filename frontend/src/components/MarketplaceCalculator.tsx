import React, { useState, useEffect } from 'react';
import {
  Calculator,
  ArrowRight,
  CreditCard,
  Truck,
  CheckCircle,
  ExternalLink,
  ShieldCheck,
  Send,
  Building2,
  Phone,
  MapPin,
  Clock,
  Sparkles,
  AlertCircle,
  Check,
  Copy,
} from 'lucide-react';
import { Marketplace, ParsedProduct, Order } from '../types';
import { calculateDoorstepPricing } from '../services/pricingEngine';
import { parseMarketplaceLink } from '../services/marketplaceParser';
import { SAMPLE_PRODUCTS } from '../data/sampleProducts';

interface PriceEstimationProps {
  officialRate: number;
  initialProduct?: ParsedProduct | null;
  onOrderCompleted: (order: Order) => void;
}

export const MarketplaceCalculator: React.FC<PriceEstimationProps> = ({
  officialRate,
  initialProduct,
  onOrderCompleted,
}) => {
  const [inputUrlOrText, setInputUrlOrText] = useState<string>('');
  const [product, setProduct] = useState<ParsedProduct>(() => {
    return initialProduct || SAMPLE_PRODUCTS[0];
  });

  // Whenever initialProduct changes from Search Explorer, update
  useEffect(() => {
    if (initialProduct) {
      setProduct(initialProduct);
      setInputUrlOrText(initialProduct.url);
    }
  }, [initialProduct]);

  // Pricing: Exchanging and adding 88%, 25% deposit rounded to nearest 100 ETB
  const pricing = calculateDoorstepPricing(product.originalPriceUsd, officialRate);

  // Checkout modal / agreement step
  const [showPaymentStep, setShowPaymentStep] = useState<boolean>(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<
    'telebirr' | 'cbe_birr' | 'awash_bank' | 'boa_digital'
  >('telebirr');

  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [deliveryCity, setDeliveryCity] = useState<string>('አዲስ አበባ');
  const [deliverySubcity, setDeliverySubcity] = useState<string>('ቦሌ');
  const [deliveryLandmark, setDeliveryLandmark] = useState<string>('');
  const [transactionRef, setTransactionRef] = useState<string>('');
  const [orderConfirmed, setOrderConfirmed] = useState<Order | null>(null);
  const [copiedAccount, setCopiedAccount] = useState<boolean>(false);

  const handleEstimateLink = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputUrlOrText.trim()) return;

    const parsed = parseMarketplaceLink(inputUrlOrText.trim());
    setProduct(parsed);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAccount(true);
    setTimeout(() => setCopiedAccount(false), 2000);
  };

  const handleCompleteOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerPhone.trim() || !deliveryLandmark.trim()) {
      alert('እባክዎ ስልክ ቁጥርዎን እና የመኖሪያ ምልክትዎን ያስገቡ።');
      return;
    }

    const orderNumber = `KC-${Math.floor(100000 + Math.random() * 900000)}`;

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber,
      createdAt: new Date().toISOString(),
      customerName: customerName.trim() || 'የኮርቻ ደንበኛ',
      customerPhone: customerPhone.trim(),
      customerTelegramUser: '@ethio_customer',
      deliveryCity,
      deliverySubcity,
      deliveryLandmark: deliveryLandmark.trim(),
      item: {
        product,
        quantity: 1,
        selectedSize: product.availableSizes[0] || 'Standard',
        selectedColor: product.availableColors[0] || 'Default',
        pricing,
      },
      termsAgreed: true,
      termsAgreedAt: new Date().toISOString(),
      depositStatus: 'pending_verification',
      depositMethod: selectedPaymentMethod,
      telebirrTxnId: transactionRef.trim() || 'TB-DIGITAL',
      status: 'pending_deposit',
      workerNotified: true,
    };

    onOrderCompleted(newOrder);
    setOrderConfirmed(newOrder);
    setShowPaymentStep(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Intro Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Calculator className="w-5 h-5" />
            </span>
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
              የዋጋ ማስያ (Price Estimation Site)
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            የ Shein፣ Temu እና AliExpress የበር ላይ ዋጋ ማስያ
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm mt-1 leading-relaxed">
            የእቃውን ሊንክ እዚህ በማስገባት በይፋዊ ምንዛሬና በ <b>88% ማድረሻ ክፍያ</b> የተሰላውን የኢትዮጵያ ብር ዋጋ ያግኙ። ከተስማሙ 25% ቅድመ ክፍያ በቴሌብር በመክፈል ያዛሉ፤ ቀሪው 75% እቃው በርዎ ላይ ሲደርስ ይከፈላል።
          </p>
        </div>
      </div>

      {/* Main Link Input & Estimate Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
        <form onSubmit={handleEstimateLink} className="space-y-4">
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
            የእቃውን ሊንክ እዚህ ይለጥፉ (Paste Product Link):
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={inputUrlOrText}
              onChange={(e) => setInputUrlOrText(e.target.value)}
              placeholder="Paste Shein, Temu, or AliExpress link here (e.g. https://www.shein.com/...)..."
              className="flex-1 bg-slate-950 border border-slate-700 rounded-2xl px-5 py-3.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
            />
            <button
              type="submit"
              className="py-3.5 px-6 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer whitespace-nowrap"
            >
              <span>ዋጋውን አስላ (Calculate Price)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>

        {/* Quick sample chips */}
        <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-slate-800/80 text-xs text-slate-400">
          <span className="font-semibold text-slate-400">ምሳሌዎች (Samples):</span>
          {SAMPLE_PRODUCTS.slice(0, 4).map((sample) => (
            <button
              key={sample.id}
              onClick={() => {
                setProduct(sample);
                setInputUrlOrText(sample.url);
              }}
              className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-500/50 text-slate-300 hover:text-white transition-colors"
            >
              {sample.title.slice(0, 22)}... (${sample.originalPriceUsd})
            </button>
          ))}
        </div>
      </div>

      {/* Clean Price Estimation Result Card (No confusing backend math) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Product Visual & Basic Details (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
          <div className="relative h-64 bg-slate-950">
            <img
              src={product.imageUrl}
              alt={product.title}
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute top-3 left-3 px-3 py-1 rounded-xl bg-slate-950/85 backdrop-blur-sm text-xs font-bold uppercase tracking-wider text-amber-300 border border-slate-800">
              {product.marketplace}
            </div>
            <div className="absolute top-3 right-3 px-2.5 py-1 rounded-xl bg-slate-950/80 backdrop-blur-sm text-xs font-semibold text-slate-300">
              {product.category}
            </div>
          </div>

          <div className="p-6 space-y-3">
            <h3 className="text-base font-bold text-white leading-snug">{product.title}</h3>
            {product.titleAmharic && (
              <p className="text-xs text-slate-400">{product.titleAmharic}</p>
            )}

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span>የማድረሻ ጊዜ: <b className="text-white">10 - 18 የስራ ቀናት</b></span>
              <a
                href={product.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sky-400 hover:text-sky-300 flex items-center gap-1 font-semibold"
              >
                <span>ዋናውን እቃ ተመልከት</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>

        {/* Clean Landed Birr Estimation & Action (7 cols) */}
        <div className="lg:col-span-7 bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                የተሰላ የበር ላይ ዋጋ (Doorstep Landed Price)
              </span>
              <h4 className="text-xl font-black text-white mt-0.5">የዋጋ ማጠቃለያ</h4>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
              የ 25% + 75% ክፍፍል
            </span>
          </div>

          {/* Clean Customer Landed Total */}
          <div className="bg-slate-950/90 rounded-2xl p-5 border border-slate-800/90 space-y-2">
            <span className="text-xs text-slate-400 font-semibold uppercase">
              ጠቅላላ የበር ላይ ዋጋ በብር (Total Doorstep Landed Price):
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl sm:text-5xl font-black text-amber-400 tracking-tight">
                {pricing.totalPriceEtb.toLocaleString()}
              </span>
              <span className="text-xl font-bold text-amber-300">ብር (ETB)</span>
            </div>
            <p className="text-xs text-slate-400">
              ይህ ዋጋ የአየር ጭነት፣ የጉምሩክ ቀረጥና አዲስ አበባ በርዎ ድረስ ማድረስን ሙሉ በሙሉ ያካተተ ነው።
            </p>
          </div>

          {/* 25% Deposit (Approximated to near 100) and 75% on Delivery */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-emerald-950/30 border border-emerald-800/50 space-y-1">
              <span className="text-xs text-emerald-400 font-bold flex items-center gap-1.5">
                <CreditCard className="w-4 h-4" />
                አሁን የሚከፈል 25% ቅድመ ክፍያ:
              </span>
              <div className="text-2xl font-black text-emerald-300">
                {pricing.depositAmountEtb.toLocaleString()} <span className="text-xs font-medium text-emerald-400">ብር</span>
              </div>
              <p className="text-[11px] text-slate-400 pt-1">
                (ወደ ቅርብ 100 ብር የተጠጋጋ • በቴሌብር/CBE የሚከፈል)
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-xs text-sky-400 font-bold flex items-center gap-1.5">
                <Truck className="w-4 h-4" />
                ቀሪ 75% እቃው በርዎ ሲደርስ:
              </span>
              <div className="text-2xl font-black text-white">
                {pricing.codAmountEtb.toLocaleString()} <span className="text-xs font-medium text-slate-400">ብር</span>
              </div>
              <p className="text-[11px] text-slate-400 pt-1">
                (እቃውን ተረክበው ሲፈትሹ በጥሬ ገንዘብ ወይም ቴሌብር)
              </p>
            </div>
          </div>

          {/* Agreement Button */}
          {!orderConfirmed ? (
            <button
              onClick={() => setShowPaymentStep(true)}
              className="w-full py-4 px-6 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-base flex items-center justify-center gap-2 shadow-xl shadow-amber-500/25 transition-all cursor-pointer"
            >
              <span>በዋጋው ተስማምቻለሁ — የ 25% ቅድመ ክፍያ ፈጽም (Agree & Pay 25%)</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          ) : (
            <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
                <span className="font-bold text-sm">ትዕዛዝ #{orderConfirmed.orderNumber} ተመዝግቧል!</span>
              </div>
              <button
                onClick={() => setOrderConfirmed(null)}
                className="text-xs underline text-white cursor-pointer"
              >
                ሌላ እቃ እዘዝ
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Payment Step & Digital Options Drawer / Modal */}
      {showPaymentStep && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl space-y-6 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                  ደረጃ 2: የ 25% ቅድመ ክፍያና አድራሻ
                </span>
                <h3 className="text-xl font-black text-white">ዲጂታል የክፍያ አማራጮች</h3>
              </div>
              <button
                onClick={() => setShowPaymentStep(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕ ዝጋ
              </button>
            </div>

            {/* Payable Amount Reminder */}
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
              <div>
                <span className="text-xs text-amber-300 font-semibold block">አሁን የሚከፈለው 25% ቅድመ ክፍያ:</span>
                <span className="text-2xl font-black text-amber-400">
                  {pricing.depositAmountEtb.toLocaleString()} ብር
                </span>
              </div>
              <span className="text-xs text-slate-400 text-right">
                ቀሪ: {pricing.codAmountEtb.toLocaleString()} ብር<br />
                (ሲደርስ ይከፈላል)
              </span>
            </div>

            {/* Digital Payment Options in Ethiopia */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                የክፍያ ዘዴ ይምረጡ (Payment Method):
              </label>

              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setSelectedPaymentMethod('telebirr')}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    selectedPaymentMethod === 'telebirr'
                      ? 'bg-emerald-950/40 border-emerald-500 text-white shadow-md'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  <div className="font-bold text-sm text-emerald-400">ቴሌብር (Telebirr)</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">የስልክ ቁጥር: +251911234567</div>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedPaymentMethod('cbe_birr')}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    selectedPaymentMethod === 'cbe_birr'
                      ? 'bg-purple-950/40 border-purple-500 text-white shadow-md'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  <div className="font-bold text-sm text-purple-400">CBE Birr / ንግድ ባንክ</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">ሂሳብ: 1000123456789</div>
                </button>
              </div>

              {/* Account details box */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-400 block">የተቀባይ ስም / ተቋም:</span>
                  <span className="font-bold text-white">ኮርቻ ሎጂስቲክስ (Korcha Logistics)</span>
                </div>
                <button
                  onClick={() => handleCopy(selectedPaymentMethod === 'telebirr' ? '+251911234567' : '1000123456789')}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1.5 transition-colors"
                >
                  {copiedAccount ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedAccount ? 'ተገልብጧል' : 'ኮፒ'}</span>
                </button>
              </div>
            </div>

            {/* Customer Contact & Landmark Form */}
            <form onSubmit={handleCompleteOrder} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    ስምዎ (Full Name):
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="ለምሳሌ: አበበ ከበደ"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    ስልክ ቁጥር (Primary Phone):
                  </label>
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="0911234567 ወይም 0711..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    ከተማ (City):
                  </label>
                  <input
                    type="text"
                    value={deliveryCity}
                    onChange={(e) => setDeliveryCity(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    ክፍለ ከተማ (Subcity):
                  </label>
                  <input
                    type="text"
                    value={deliverySubcity}
                    onChange={(e) => setDeliverySubcity(e.target.value)}
                    placeholder="ቦሌ፣ አራዳ፣ የካ..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  የመኖሪያ አካባቢ ወይም ምልክት (Landmark):
                </label>
                <input
                  type="text"
                  required
                  value={deliveryLandmark}
                  onChange={(e) => setDeliveryLandmark(e.target.value)}
                  placeholder="ምሳሌ: ቦሌ መድኃኒዓለም፣ ከአብሲኒያ ባንክ ጀርባ ወይም ፒያሳ ቴሌ"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  የቴሌብር / የባንክ የግብይት ቁጥር (Transaction ID / Ref):
                </label>
                <input
                  type="text"
                  value={transactionRef}
                  onChange={(e) => setTransactionRef(e.target.value)}
                  placeholder="ምሳሌ: TB98210492 ወይም CBE1920"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/30 transition-all cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>ክፍያውን ፈጽሜያለሁ — ለኮርቻ ሰራተኞች ላክ (Submit & Alert Workers)</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
