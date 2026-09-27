// frontend/src/components/ProductDetailModal.tsx
import React, { useState } from "react";
import { Language, Product } from "../types";
import { t } from "../utils/translations";

interface ProductDetailModalProps {
  product: Product | null;
  lang: Language;
  onClose: () => void;
  onAddToCart: (product: Product, size: string, color: string, notes: string) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  lang,
  onClose,
  onAddToCart,
}) => {
  if (!product) return null;

  // Default to first available size and color
  const defaultSize = product.sizes && product.sizes.length > 0 ? product.sizes[0] : "Standard";
  const defaultColor = product.colors && product.colors.length > 0 ? product.colors[0].name : "Standard";

  const [selectedSize, setSelectedSize] = useState(defaultSize);
  const [selectedColor, setSelectedColor] = useState(defaultColor);
  const [notes, setNotes] = useState("");

  const title = lang === "am" && product.nameAm ? product.nameAm : product.name;
  const description = lang === "am" && product.descriptionAm ? product.descriptionAm : product.description;

  const handleAdd = () => {
    onAddToCart(product, selectedSize, selectedColor, notes);
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="detail-modal-sheet" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="btn-modal-close" onClick={onClose}>
          ✕
        </button>

        {/* Large photo */}
        <div className="modal-photo-wrap">
          <img src={product.imageUrl} alt={title} />
          {product.badge && <span className="modal-badge">{product.badge}</span>}
        </div>

        <div className="modal-content-wrap">
          <h2 className="modal-product-title">{title}</h2>
          <div className="modal-rating-row">
            <span>⭐ {product.rating} ({product.reviewsCount} reviews)</span>
            <span>🔥 {product.salesCount}</span>
          </div>

          {/* Pricing in ETB only */}
          <div className="modal-pricing-box">
            <div className="etb-total-line">
              <span className="etb-price-large">{product.priceEtb.toLocaleString()} ETB</span>
            </div>
            <div className="etb-split-sub">
              <span className="deposit-pill">25% ቅድመ ክፍያ: {product.depositEtb.toLocaleString()} ETB</span>
              <span className="cod-pill">75% ቀሪ ሂሳብ: {product.codEtb.toLocaleString()} ETB</span>
            </div>
          </div>

          {/* Native Color Swatches (No redirect needed!) */}
          {product.colors && product.colors.length > 0 && (
            <div className="variant-block">
              <label className="variant-label">
                <strong>{lang === "am" ? "ቀለም ይምረጡ (Color)" : "Select Color"}:</strong>{" "}
                <span className="chosen-variant-tag">{selectedColor}</span>
              </label>
              <div className="color-swatches-row">
                {product.colors.map((c) => (
                  <button
                    key={c.name}
                    type="button"
                    className={`color-swatch-circle ${selectedColor === c.name ? "active" : ""}`}
                    style={{ backgroundColor: c.hex }}
                    onClick={() => setSelectedColor(c.name)}
                    title={c.name}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Native Size Chips (No redirect needed!) */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="variant-block">
              <label className="variant-label">
                <strong>{lang === "am" ? "መጠን ይምረጡ (Size)" : "Select Size"}:</strong>{" "}
                <span className="chosen-variant-tag">{selectedSize}</span>
              </label>
              <div className="size-chips-row">
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    type="button"
                    className={`size-chip-btn ${selectedSize === s ? "active" : ""}`}
                    onClick={() => setSelectedSize(s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          <div className="modal-description-box">
            <h4>{lang === "am" ? "የእቃው ዝርዝር መረጃ" : "Product Description"}</h4>
            <p className="modal-description">{description}</p>
          </div>

          {/* Specifications */}
          {product.specs && Object.keys(product.specs).length > 0 && (
            <div className="modal-specs-box">
              <h4>{lang === "am" ? "ዝርዝር መግለጫዎች" : "Specifications"}</h4>
              <table className="specs-table">
                <tbody>
                  {Object.entries(product.specs).map(([key, val]) => (
                    <tr key={key}>
                      <td className="spec-key">{key}</td>
                      <td className="spec-val">{val}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Optional Notes */}
          <div className="variant-block">
            <label className="variant-label">
              <strong>{lang === "am" ? "ተጨማሪ ማስታወሻ (አስፈላጊ ከሆነ)" : "Special Instructions (Optional)"}</strong>
            </label>
            <input
              type="text"
              className="text-input"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Please ensure bubble-wrap packaging"
            />
          </div>

          {/* Native Add to Bag Button */}
          <button
            type="button"
            className="btn-add-modal"
            onClick={handleAdd}
          >
            + {t("addToBag", lang)} • {product.priceEtb.toLocaleString()} ETB
          </button>
        </div>
      </div>
    </div>
  );
};
