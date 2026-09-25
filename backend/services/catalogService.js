// backend/services/catalogService.js
import { calculateOrderPricing } from "./pricingService.js";

const catalog = [
  {
    id: "cl-01",
    name: "Modern Tibeb-Trim Casual Linen Shirt",
    nameAm: "ዘመናዊ የጥበብ ጠርዝ የተደረገበት የሊነን ሸሚዝ",
    category: "clothes",
    usdPrice: 15.0,
    imageUrl: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&auto=format&fit=crop&q=80",
    sheinUrl: "https://www.shein.com/men-shirts-c-1973.html",
    badge: "HOT",
    inStock: true,
  },
  {
    id: "cl-02",
    name: "Contemporary Chiffon Habesha Kemis",
    nameAm: "ዘመናዊ የሺፎን ሀበሻ ቀሚስ",
    category: "clothes",
    usdPrice: 38.0,
    imageUrl: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&auto=format&fit=crop&q=80",
    sheinUrl: "https://www.shein.com/women-dresses-c-1727.html",
    badge: "LOCAL CRAFT",
    inStock: true,
  },
  {
    id: "el-01",
    name: "Dual USB-C 20,000mAh Power Bank",
    nameAm: "20,000mAh ፈጣን ቻርጀር ፓወር ባንክ",
    category: "electronics",
    usdPrice: 18.5,
    imageUrl: "https://images.unsplash.com/photo-1609592806346-65825b747041?w=600&auto=format&fit=crop&q=80",
    sheinUrl: "https://www.shein.com/electronics-c-2879.html",
    badge: "FLASH SALE",
    inStock: true,
  },
  {
    id: "el-02",
    name: "Wireless ANC Bluetooth Earbuds",
    nameAm: "ገመድ አልባ ብሉቱዝ የጆሮ ማዳመጫ",
    category: "electronics",
    usdPrice: 14.0,
    imageUrl: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&auto=format&fit=crop&q=80",
    sheinUrl: "https://www.shein.com/headphones-c-3101.html",
    badge: "SALE",
    inStock: true,
  },
  {
    id: "co-01",
    name: "Pure Qasil Purifying Cleanser & Mask Powder",
    nameAm: "ኦርጋኒክ የቃሲል የፊት ማጽጃ እና ማስክ",
    category: "cosmetics",
    usdPrice: 6.5,
    imageUrl: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&auto=format&fit=crop&q=80",
    sheinUrl: "https://www.shein.com/beauty-c-1863.html",
    badge: "LOCAL CRAFT",
    inStock: true,
  },
];

export function getCatalogProducts() {
  return catalog.map((item) => {
    const pricing = calculateOrderPricing(item.usdPrice);
    return {
      ...item,
      pricing,
      priceEtb: pricing.totalEtb,
      depositEtb: pricing.depositEtb,
      codEtb: pricing.codEtb,
    };
  });
}

export function syncDailyCatalog() {
  console.log();
  return {
    success: true,
    syncedItemsCount: catalog.length,
    timestamp: new Date().toISOString(),
  };
}
