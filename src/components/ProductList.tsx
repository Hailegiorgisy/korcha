import type { Product } from "../types/product";
import ProductCard from "./ProductCard";

interface ProductListProps {
  products: Product[];
  searchTerm: string;
  onToggleStock: (id: string) => void;
  onRemove: (id: string) => void;
}

const ProductList = ({
  products,
  searchTerm,
  onToggleStock,
  onRemove,
}: ProductListProps) => {
  if (products.length === 0) {
    return (
      <div className="empty-state">
        {searchTerm.trim()
          ? "No products match your search. Try a different keyword."
          : "No products yet. Add your first product using the form."}
      </div>
    );
  }

  return (
    <div className="product-list">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onToggleStock={onToggleStock}
          onRemove={onRemove}
        />
      ))}
    </div>
  );
};

export default ProductList;
