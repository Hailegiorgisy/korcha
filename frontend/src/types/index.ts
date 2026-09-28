// frontend/src/types/index.ts

export type Language = "am" | "en";

export interface QuotedProduct {
  id: string;
  sheinUrl: string;
  title: string;
  originalUsd: number;
  priceEtb: number;
  depositEtb: number;
  codEtb: number;
  selectedSize: string;
  selectedColor: string;
  customNotes?: string;
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
  items: QuotedProduct[];
  totalPrice: number;
  paymentOption: "Deposit25" | "NoAdvancePayment";
  depositAmount: number;
  codAmount: number;
  depositPaid: boolean;
  telebirrTransactionId?: string;
  status: "Pending" | "Dispatched" | "Delivered";
  createdAt: string;
  deliveryProfile: DeliveryProfile;
}

export interface HelpTicket {
  ticketId?: string;
  name: string;
  phone: string;
  message: string;
  sheinLink?: string;
}
