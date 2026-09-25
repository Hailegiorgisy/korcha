import type { Product } from "../types/product";

interface ProductCardProps {
  product: Product;
  onToggleStock: (id: string) => void;
  onRemove: (id: string) => void;
}

const ProductCard = ({
  product,
  onToggleStock,
  onRemove,
}: ProductCardProps) => {
  return (
    <article
      className={`product-card ${product.inStock ? "in-stock" : "out-of-stock"}`}
    >
      <div className="product-card-header">
        <div>
          <h3>{product.name}</h3>
          <p className="product-category">{product.category}</p>
        </div>
        <span
          className={`badge ${product.inStock ? "badge-success" : "badge-warning"}`}
        >
          {product.inStock ? "In Stock" : "Out of Stock"}
        </span>
      </div>

      <p className="product-price">${product.price.toFixed(2)}</p>

      <div className="product-meta">
        <div className="meta-row">
          <span>Inventory ID</span>
          <span>{product.id}</span>
        </div>
      </div>

      {!product.inStock && (
        <p className="stock-alert">This item needs restocking.</p>
      )}

      <div className="product-actions">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => onToggleStock(product.id)}
        >
          {product.inStock ? "Mark Out of Stock" : "Mark In Stock"}
        </button>
        <button
          type="button"
          className="btn btn-danger"
          onClick={() => onRemove(product.id)}
        >
          Remove
        </button>
      </div>
    </article>
  );
};

export default ProductCard;
