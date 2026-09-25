// src/utils/kvStore.ts
import { Product, Order } from "../types";

const PRODUCTS_KEY = "shein_et_products_v1";
const ORDERS_KEY = "shein_et_orders_v1";

const DEFAULT_PRODUCTS: Product[] = [
  {
    id: "prod-001",
    name: "Modern Tibeb-Trim Casual Linen Shirt",
    nameAm: "ዘመናዊ የጥበብ ጠርዝ የተደረገበት የሊነን ሸሚዝ",
    category: "clothes",
    priceEtb: 2813,
    originalUsd: 15.0,
    imageUrl: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&auto=format&fit=crop&q=80",
    sheinUrl: "https://www.shein.com/men-shirts-c-1973.html",
    badge: "HOT",
    inStock: true,
  },
  {
    id: "prod-002",
    name: "Contemporary Chiffon Habesha Kemis",
    nameAm: "ዘመናዊ የሺፎን ሀበሻ ቀሚስ",
    category: "clothes",
    priceEtb: 7125,
    originalUsd: 38.0,
    imageUrl: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&auto=format&fit=crop&q=80",
    sheinUrl: "https://www.shein.com/women-dresses-c-1727.html",
    badge: "LOCAL CRAFT",
    inStock: true,
  },
  {
    id: "prod-003",
    name: "Dual USB-C 20,000mAh Power Bank",
    nameAm: "20,000mAh ፈጣን ቻርጀር ፓወር ባንክ",
    category: "electronics",
    priceEtb: 3469,
    originalUsd: 18.5,
    imageUrl: "https://images.unsplash.com/photo-1609592806346-65825b747041?w=600&auto=format&fit=crop&q=80",
    sheinUrl: "https://www.shein.com/electronics-c-2879.html",
    badge: "FLASH SALE",
    inStock: true,
  },
  {
    id: "prod-004",
    name: "Wireless ANC Bluetooth Earbuds",
    nameAm: "ገመድ አልባ ብሉቱዝ የጆሮ ማዳመጫ",
    category: "electronics",
    priceEtb: 2625,
    originalUsd: 14.0,
    imageUrl: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&auto=format&fit=crop&q=80",
    sheinUrl: "https://www.shein.com/headphones-c-3101.html",
    badge: "SALE",
    inStock: true,
  },
  {
    id: "prod-005",
    name: "Pure Qasil Purifying Cleanser & Mask Powder",
    nameAm: "ኦርጋኒክ የቃሲል የፊት ማጽጃ እና ማስክ",
    category: "cosmetics",
    priceEtb: 1219,
    originalUsd: 6.5,
    imageUrl: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&auto=format&fit=crop&q=80",
    sheinUrl: "https://www.shein.com/beauty-c-1863.html",
    badge: "LOCAL CRAFT",
    inStock: true,
  },
];

export const kvStore = {
  getProducts(): Product[] {
    try {
      const data = localStorage.getItem(PRODUCTS_KEY);
      if (!data) {
        localStorage.setItem(PRODUCTS_KEY, JSON.stringify(DEFAULT_PRODUCTS));
        return DEFAULT_PRODUCTS;
      }
      return JSON.parse(data);
    } catch {
      return DEFAULT_PRODUCTS;
    }
  },

  addProduct(product: Product): void {
    const list = kvStore.getProducts();
    list.unshift(product);
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(list));
  },

  getOrders(): Order[] {
    try {
      const data = localStorage.getItem(ORDERS_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveOrder(order: Order): void {
    const orders = kvStore.getOrders();
    orders.unshift(order);
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
  },

  updateOrderStatus(orderId: string, status: "Pending" | "Dispatched"): void {
    const orders = kvStore.getOrders();
    const target = orders.find((o) => o.orderId === orderId);
    if (target) {
      target.status = status;
      localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
    }
  },
};
