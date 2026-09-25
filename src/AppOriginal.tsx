import { useMemo, useState } from "react";
import FeaturedProduct from "./components/FeaturedProduct";
import InventorySummary from "./components/InventorySummary";
import ProductForm from "./components/ProductForm";
import ProductList from "./components/ProductList";
import ProductToolbar from "./components/ProductToolbar";
import { initialProducts } from "./data/initialProducts";
import type { NewProductInput, Product, SortOption } from "./types/product";
import {
  calculateInventorySummary,
  createProductFromInput,
  filterProducts,
  getFeaturedProduct,
  sortProducts,
} from "./utils/productHelpers";
import "./App.css";

const App = () => {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [sortOption, setSortOption] = useState<SortOption>("default");

  const visibleProducts = useMemo(() => {
    const filtered = filterProducts(products, searchTerm);
    return sortProducts(filtered, sortOption);
  }, [products, searchTerm, sortOption]);

  const featuredProduct = useMemo(
    () => getFeaturedProduct(products),
    [products],
  );

  const summary = useMemo(
    () => calculateInventorySummary(products),
    [products],
  );

  const handleAddProduct = (input: NewProductInput): void => {
    setProducts((prevProducts) => [
      ...prevProducts,
      createProductFromInput(input),
    ]);
  };

  const handleToggleStock = (id: string): void => {
    setProducts((prevProducts) =>
      prevProducts.map((product) =>
        product.id === id
          ? { ...product, inStock: !product.inStock }
          : product,
      ),
    );
  };

  const handleRemoveProduct = (id: string): void => {
    setProducts((prevProducts) =>
      prevProducts.filter((product) => product.id !== id),
    );
  };

  const handleClearAll = (): void => {
    setProducts([]);
  };

  return (
    <div className="app-shell">
      <header className="app-hero">
        <h1>Product Dashboard</h1>
        <p>
          Manage classroom shop inventory with organized summaries, search,
          stock controls, and product registration.
        </p>
      </header>

      <InventorySummary summary={summary} />

      <div className="dashboard-top">
        <FeaturedProduct product={featuredProduct} />
        <ProductToolbar
          searchTerm={searchTerm}
          sortOption={sortOption}
          hasProducts={products.length > 0}
          onSearchChange={setSearchTerm}
          onSortChange={setSortOption}
          onClearAll={handleClearAll}
        />
      </div>

      <div className="dashboard-main">
        <section className="panel products-panel">
          <div className="panel-header">
            <div>
              <h2 className="panel-title">Product Catalog</h2>
              <p className="panel-subtitle">
                {visibleProducts.length} product
                {visibleProducts.length === 1 ? "" : "s"} shown
                {searchTerm.trim() ? ` matching "${searchTerm.trim()}"` : ""}
              </p>
            </div>
          </div>
          <ProductList
            products={visibleProducts}
            searchTerm={searchTerm}
            onToggleStock={handleToggleStock}
            onRemove={handleRemoveProduct}
          />
        </section>

        <aside className="panel form-panel">
          <ProductForm products={products} onAddProduct={handleAddProduct} />
        </aside>
      </div>
    </div>
  );
};

export default App;
