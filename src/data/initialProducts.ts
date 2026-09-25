import type { Product } from "../types/product";

export const initialProducts: Product[] = [
  {
    id: "prod-1",
    name: "Wireless Mouse",
    price: 24.99,
    category: "Accessories",
    inStock: true,
  },
  {
    id: "prod-2",
    name: "USB-C Cable",
    price: 12.5,
    category: "Accessories",
    inStock: true,
  },
  {
    id: "prod-3",
    name: "React Handbook",
    price: 35.0,
    category: "Books",
    inStock: false,
  },
  {
    id: "prod-4",
    name: "Laptop Stand",
    price: 49.99,
    category: "Furniture",
    inStock: true,
  },
];
