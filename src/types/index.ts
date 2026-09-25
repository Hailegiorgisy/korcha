// src/types/index.ts

export type Language = "en" | "am";

export type Category = "clothes" | "electronics" | "cosmetics";

export interface Product {
  id: string;
  name: string;
  nameAm?: string;
  category: Category;
  priceEtb: number; // in ETB
  originalUsd?: number;
  imageUrl: string;
  sheinUrl?: string;
  badge?: "HOT" | "SALE" | "LOCAL CRAFT" | "FLASH SALE";
  inStock: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface DeliveryProfile {
  userId: string;
  gps: {
    lat: number;
    lng: number;
  };
  landmark: string;
  primaryPhone: string;
  backupPhone: string;
  deliveryMethod: "MotorCourier" | "HubPickup";
}

export interface Order {
  orderId: string;
  userId: string;
  items: CartItem[];
  totalPrice: number;
  depositAmount: number;
  codAmount: number;
  depositPaid: boolean;
  status: "Pending" | "Dispatched";
  createdAt: string;
  deliveryProfile: DeliveryProfile;
}
