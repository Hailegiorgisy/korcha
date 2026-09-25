import type { Product } from "../types/product";

interface FeaturedProductProps {
  product: Product | null;
}

const FeaturedProduct = ({ product }: FeaturedProductProps) => {
  if (!product) {
    return (
      <section className="featured-product panel">
        <p className="featured-label">Featured Product</p>
        <h3>No products available</h3>
        <p className="panel-subtitle">
          Add products to highlight the most expensive item here.
        </p>
      </section>
    );
  }

  return (
    <section className="featured-product">
      <p className="featured-label">Featured Product</p>
      <h3>{product.name}</h3>
      <div className="featured-meta">
        <span className="featured-price">${product.price.toFixed(2)}</span>
        <span>{product.category}</span>
        <span>{product.inStock ? "Available now" : "Currently unavailable"}</span>
      </div>
    </section>
  );
};

export default FeaturedProduct;
