// frontend/src/components/ProductCatalog.tsx
import React, { useState } from "react";
import { Category, Language, Product } from "../types";
import { t } from "../utils/translations";

interface ProductCatalogProps {
  products: Product[];
  lang: Language;
  onAddToCart: (product: Product) => void;
}

export const ProductCatalog: React.FC<ProductCatalogProps> = ({
  products,
  lang,
  onAddToCart,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<Category | "all">("all");

  const categories: { key: Category | "all"; label: string }[] = [
    { key: "all", label: t("allCategories", lang) },
    { key: "clothes", label: t("clothes", lang) },
    { key: "electronics", label: t("electronics", lang) },
    { key: "cosmetics", label: t("cosmetics", lang) },
  ];

  const filteredProducts =
    selectedCategory === "all"
      ? products
      : products.filter((p) => p.category === selectedCategory);

  const handleOpenShein = (url?: string) => {
    if (!url) return;
    if ((window as any).Telegram?.WebApp?.openLink) {
      (window as any).Telegram.WebApp.openLink(url);
    } else {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className="catalog-wrapper">
      {/* Category Pills Navigation */}
      <div className="category-scroll-bar">
        {categories.map((cat) => (
          <button
            key={cat.key}
            type="button"
            className={`category-pill ${selectedCategory === cat.key ? "active" : ""}`}
            onClick={() => setSelectedCategory(cat.key)}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Shein Grid */}
      <div className="shein-grid">
        {filteredProducts.map((item) => {
          const displayName = lang === "am" && item.nameAm ? item.nameAm : item.name;
          const deposit = Math.round(item.priceEtb * 0.25);

          return (
            <div key={item.id} className="shein-card">
              {item.badge && <span className="shein-badge">{item.badge}</span>}

              <div className="image-box">
                <img src={item.imageUrl} alt={displayName} loading="lazy" />
              </div>

              <div className="card-body">
                <h3 className="card-title">{displayName}</h3>

                <div className="card-pricing">
                  <span className="price-main">{item.priceEtb.toLocaleString()} ETB</span>
                  <span className="deposit-tag">25% Dep: {deposit.toLocaleString()} ETB</span>
                </div>

                <div className="card-meta">
                  <span className="meta-stock">● {t("inStock", lang)}</span>
                  {item.sheinUrl && (
                    <button
                      type="button"
                      className="btn-shein-link"
                      onClick={() => handleOpenShein(item.sheinUrl)}
                    >
                      ↗ {t("viewOnShein", lang)}
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  className="btn-add-bag"
                  onClick={() => onAddToCart(item)}
                >
                  + {t("addToBag", lang)}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
