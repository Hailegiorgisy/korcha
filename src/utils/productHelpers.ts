import type { NewProductInput, Product, SortOption } from "../types/product";

export function createProductFromInput(input: NewProductInput): Product {
  return {
    id: crypto.randomUUID(),
    name: input.name.trim(),
    price: input.price,
    category: input.category.trim(),
    inStock: input.inStock,
  };
}

export function isDuplicateProductName(
  products: Product[],
  name: string,
): boolean {
  const normalizedName = name.trim().toLowerCase();
  return products.some(
    (product) => product.name.toLowerCase() === normalizedName,
  );
}

export function filterProducts(
  products: Product[],
  searchTerm: string,
): Product[] {
  const query = searchTerm.trim().toLowerCase();

  if (!query) {
    return products;
  }

  return products.filter(
    (product) =>
      product.name.toLowerCase().includes(query) ||
      product.category.toLowerCase().includes(query),
  );
}

export function sortProducts(
  products: Product[],
  sortOption: SortOption,
): Product[] {
  const sorted = [...products];

  switch (sortOption) {
    case "price-asc":
      return sorted.sort((a, b) => a.price - b.price);
    case "price-desc":
      return sorted.sort((a, b) => b.price - a.price);
    default:
      return sorted;
  }
}

export function getFeaturedProduct(products: Product[]): Product | null {
  if (products.length === 0) {
    return null;
  }

  return products.reduce((mostExpensive, product) =>
    product.price > mostExpensive.price ? product : mostExpensive,
  );
}

export function calculateInventorySummary(products: Product[]): {
  totalProducts: number;
  inStockCount: number;
  outOfStockCount: number;
  totalStockValue: number;
} {
  const inStockProducts = products.filter((product) => product.inStock);

  return {
    totalProducts: products.length,
    inStockCount: inStockProducts.length,
    outOfStockCount: products.length - inStockProducts.length,
    totalStockValue: inStockProducts.reduce(
      (total, product) => total + product.price,
      0,
    ),
  };
}
