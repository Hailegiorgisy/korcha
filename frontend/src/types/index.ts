export type Marketplace = 'shein' | 'temu' | 'aliexpress';

export interface PricingResult {
  originalPriceUsd: number;
  multiplier: number; // 1.88
  landedPriceUsd: number; // originalPriceUsd * 1.88
  officialExchangeRate: number; // e.g. 145.50 ETB/USD
  totalPriceEtb: number; // Math.round(landedPriceUsd * officialExchangeRate)
  depositPercent: number; // 25%
  depositAmountEtb: number; // Math.round(totalPriceEtb * 0.25)
  codAmountEtb: number; // totalPriceEtb - depositAmountEtb
}

export interface ParsedProduct {
  id: string;
  marketplace: Marketplace;
  url: string;
  title: string;
  titleAmharic?: string;
  category: string;
  imageUrl: string;
  originalPriceUsd: number;
  availableSizes: string[];
  availableColors: string[];
  rating?: number;
  reviewsCount?: number;
}

export interface OrderItem {
  product: ParsedProduct;
  selectedSize?: string;
  selectedColor?: string;
  quantity: number;
  pricing: PricingResult;
}

export type OrderStatus = 
  | 'pending_deposit'
  | 'deposit_verified'
  | 'procured_in_china'
  | 'freight_in_transit'
  | 'customs_clearing'
  | 'out_for_delivery'
  | 'delivered';

export interface Order {
  id: string;
  orderNumber: string;
  createdAt: string;
  customerName: string;
  customerPhone: string;
  customerTelegramUser?: string;
  customerTelegramId?: string;
  deliveryCity: string;
  deliverySubcity: string;
  deliveryLandmark: string;
  notes?: string;
  item: OrderItem;
  termsAgreed: boolean;
  termsAgreedAt: string;
  depositStatus: 'unpaid' | 'pending_verification' | 'verified';
  depositMethod?: 'telebirr' | 'cbe_birr' | 'awash_bank' | 'boa_digital';
  telebirrTxnId?: string;
  status: OrderStatus;
  workerNotified: boolean;
}

export interface TelegramBotMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  timestamp: string;
  photoUrl?: string;
  inlineKeyboard?: {
    text: string;
    action: string;
    url?: string;
    style?: 'primary' | 'secondary' | 'success' | 'danger';
  }[][];
  quoteCard?: OrderItem;
  orderConfirmation?: Order;
}
