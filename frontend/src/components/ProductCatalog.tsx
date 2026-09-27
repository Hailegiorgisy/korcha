// frontend/src/components/ProductCatalog.tsx
import React, { useState, useMemo } from "react";
import { Category, Language, Product } from "../types";
import { t } from "../utils/translations";

interface ProductCatalogProps {
  products: Product[];
  lang: Language;
  onOpenProductDetail: (product: Product) => void;
  onAddToCartDirect: (product: Product) => void;
}

export const ProductCatalog: React.FC<ProductCatalogProps> = ({
  products,
  lang,
  onOpenProductDetail,
  onAddToCartDirect,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<Category | "all">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [visibleCount, setVisibleCount] = useState(24);

  const categories: { key: Category | "all"; label: string }[] = [
    { key: "all", label: t("allCategories", lang) },
    { key: "clothes", label: t("clothes", lang) },
    { key: "electronics", label: t("electronics", lang) },
    { key: "cosmetics", label: t("cosmetics", lang) },
  ];

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesCat = selectedCategory === "all" || p.category === selectedCategory;
      const q = searchTerm.trim().toLowerCase();
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        (p.nameAm && p.nameAm.includes(q)) ||
        p.subcategory.toLowerCase().includes(q);
      return matchesCat && matchesSearch;
    });
  }, [products, selectedCategory, searchTerm]);

  const displayedProducts = filteredProducts.slice(0, visibleCount);

  return (
    <div className="catalog-container">
      {/* Search Input */}
      <div className="search-wrap">
        <input
          type="search"
          className="search-input"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setVisibleCount(24);
          }}
          placeholder={t("searchPlaceholder", lang)}
        />
      </div>

      {/* Category Pills */}
      <div className="category-scroll-bar">
        {categories.map((cat) => (
          <button
            key={cat.key}
            type="button"
            className={`category-pill ${selectedCategory === cat.key ? "active" : ""}`}
            onClick={() => {
              setSelectedCategory(cat.key);
              setVisibleCount(24);
            }}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <div className="catalog-meta-info">
        <span>{filteredProducts.length} items found</span>
      </div>

      {/* 500 Grid (2 columns on mobile) */}
      <div className="korcha-grid">
        {displayedProducts.map((item) => {
          const title = lang === "am" && item.nameAm ? item.nameAm : item.name;

          return (
            <div key={item.id} className="korcha-card" onClick={() => onOpenProductDetail(item)}>
              {item.badge && <span className="korcha-badge">{item.badge}</span>}

              <div className="card-thumb-wrap">
                <img src={item.imageUrl} alt={title} loading="lazy" />
              </div>

              <div className="card-info">
                <h4 className="card-product-name">{title}</h4>

                {/* ETB price only! */}
                <div className="card-etb-price">
                  <span className="price-bold">{item.priceEtb.toLocaleString()} ETB</span>
                  <span className="dep-small">Dep: {item.depositEtb.toLocaleString()} ETB</span>
                </div>

                <div className="card-footer-action">
                  <button
                    type="button"
                    className="btn-quick-detail"
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenProductDetail(item);
                    }}
                  >
                    🔍 {t("viewDetails", lang)}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Load More Button */}
      {visibleCount < filteredProducts.length && (
        <div className="load-more-wrap">
          <button
            type="button"
            className="btn-load-more"
            onClick={() => setVisibleCount((prev) => prev + 24)}
          >
            {t("loadMore", lang)} ({filteredProducts.length - visibleCount} remaining)
          </button>
        </div>
      )}
    </div>
  );
};
