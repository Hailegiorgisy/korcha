export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  inStock: boolean;
}

export interface NewProductInput {
  name: string;
  price: number;
  category: string;
  inStock: boolean;
}

export type SortOption = "default" | "price-asc" | "price-desc";
