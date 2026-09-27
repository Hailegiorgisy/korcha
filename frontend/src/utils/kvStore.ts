// frontend/src/utils/kvStore.ts
import { Product, Order, QuoteRequest } from "../types";
import catalogData from "../data/catalog500.json";

const PRODUCTS_KEY = "korcha_catalog_500_v3_native_variants";
const ORDERS_KEY = "korcha_orders_v3";
const QUOTES_KEY = "korcha_quotes_v3";

export const kvStore = {
  getProducts(): Product[] {
    try {
      const data = localStorage.getItem(PRODUCTS_KEY);
      if (!data) {
        localStorage.setItem(PRODUCTS_KEY, JSON.stringify(catalogData));
        return catalogData as Product[];
      }
      const parsed = JSON.parse(data);
      // If cached data has fewer than 500 products, re-seed with full catalog
      if (!Array.isArray(parsed) || parsed.length < 500) {
        localStorage.setItem(PRODUCTS_KEY, JSON.stringify(catalogData));
        return catalogData as Product[];
      }
      return parsed as Product[];
    } catch {
      return catalogData as Product[];
    }
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

  updateOrderStatus(orderId: string, status: "Pending" | "Dispatched" | "Delivered"): void {
    const orders = kvStore.getOrders();
    const target = orders.find((o) => o.orderId === orderId);
    if (target) {
      target.status = status;
      localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
    }
  },

  getQuotes(): QuoteRequest[] {
    try {
      const data = localStorage.getItem(QUOTES_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveQuote(quote: QuoteRequest): void {
    const list = kvStore.getQuotes();
    list.unshift(quote);
    localStorage.setItem(QUOTES_KEY, JSON.stringify(list));
  },
};
