// frontend/src/types/index.ts

export type Language = "en" | "am";
export type Category = "clothes" | "electronics" | "cosmetics";

export interface ColorOption {
  name: string;
  hex: string;
}

export interface Product {
  id: string;
  name: string;
  nameAm?: string;
  category: Category;
  subcategory: string;
  priceEtb: number; // in ETB
  depositEtb: number;
  codEtb: number;
  imageUrl: string;
  sheinUrl: string;
  badge?: string;
  rating: number;
  reviewsCount: number;
  salesCount: string;
  description: string;
  descriptionAm: string;
  sizes: string[];
  colors: ColorOption[];
  specs: Record<string, string>;
  inStock: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
  customNotes?: string;
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
  telebirrTransactionId?: string;
  status: "Pending" | "Dispatched" | "Delivered";
  createdAt: string;
  deliveryProfile: DeliveryProfile;
}
