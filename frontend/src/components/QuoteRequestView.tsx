// frontend/src/components/QuoteRequestView.tsx
import React, { useState } from "react";
import { Language, Product } from "../types";
import { t } from "../utils/translations";

interface QuoteRequestViewProps {
  lang: Language;
  onAddCustomProductToCart: (product: Product, size: string, color: string, notes: string) => void;
}

export const QuoteRequestView: React.FC<QuoteRequestViewProps> = ({
  lang,
  onAddCustomProductToCart,
}) => {
  const [sheinUrl, setSheinUrl] = useState("");
  const [productTitle, setProductTitle] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [notes, setNotes] = useState("");
  const [calculatedQuote, setCalculatedQuote] = useState<{
    totalEtb: number;
    depositEtb: number;
    codEtb: number;
  } | null>(null);

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sheinUrl.trim()) return;

    // Extract title from slug if not manually specified
    try {
      const parsed = new URL(sheinUrl.trim());
      const slug = parsed.pathname.split("/").filter(Boolean).pop() || "Custom Shein Product";
      const cleaned = slug
        .replace(/-p-\\d+.*$/i, "")
        .replace(/\\.html?$/i, "")
        .replace(/[-_]/g, " ")
        .replace(/\\b\\w/g, (c) => c.toUpperCase());

      if (!productTitle) {
        setProductTitle(cleaned || "Shein Fashion Apparel");
      }
    } catch {
      // Keep existing title
    }

    // Default standard fast-fashion item estimate ($16 * 1.5 * 188 ETB = 4,512 ETB)
    const baseUsd = 16.0;
    const totalEtb = Math.round(baseUsd * 1.5 * 188.0);
    const depositEtb = Math.round(totalEtb * 0.25);
    const codEtb = totalEtb - depositEtb;

    setCalculatedQuote({ totalEtb, depositEtb, codEtb });
  };

  const handleConfirmAddToBag = () => {
    if (!calculatedQuote) return;

    const customProduct: Product = {
      id: "korcha-quote-" + Date.now(),
      name: productTitle.trim() || "Custom Shein Request",
      nameAm: "የተመረጠ የሼይን እቃ",
      category: "clothes",
      subcategory: "custom-import",
      priceEtb: calculatedQuote.totalEtb,
      depositEtb: calculatedQuote.depositEtb,
      codEtb: calculatedQuote.codEtb,
      imageUrl: "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=500&auto=format&fit=crop&q=80",
      sheinUrl: sheinUrl.trim(),
      badge: "CUSTOM QUOTE",
      rating: 5.0,
      reviewsCount: 1,
      salesCount: "Custom Order",
      description: `Custom Shein Import. Size: ${selectedSize || "Standard"}, Color: ${selectedColor || "As pictured"}. Notes: ${notes}`,
      descriptionAm: `በኮርቻ በቀጥታ ከሼይን የሚገባ እቃ። ሳይዝ፦ ${selectedSize || "መደበኛ"}፣ ከለር፦ ${selectedColor || "በፎቶው መሰረት"}`,
      inStock: true,
    };

    onAddCustomProductToCart(customProduct, selectedSize, selectedColor, notes);
    setSheinUrl("");
    setProductTitle("");
    setSelectedSize("");
    setSelectedColor("");
    setNotes("");
    setCalculatedQuote(null);
  };

  return (
    <div className="quote-view-container">
      <div className="quote-banner">
        <h2>🛍️ {t("quoteTitle", lang)}</h2>
        <p>{t("quoteSub", lang)}</p>
      </div>

      <form onSubmit={handleCalculate} className="quote-form-card">
        <div className="field-block">
          <label><strong>Shein Product URL *</strong></label>
          <input
            type="url"
            required
            className="text-input"
            value={sheinUrl}
            onChange={(e) => setSheinUrl(e.target.value)}
            placeholder={t("sheinUrlPlaceholder", lang)}
          />
        </div>

        <div className="field-block">
          <label><strong>Item Name / Description (Optional)</strong></label>
          <input
            type="text"
            className="text-input"
            value={productTitle}
            onChange={(e) => setProductTitle(e.target.value)}
            placeholder="e.g. Elegant Puff Sleeve Midi Dress"
          />
        </div>

        <div className="field-grid-2">
          <div className="field-block">
            <label><strong>{lang === "am" ? "የመረጡት ሳይዝ *" : "Selected Size *"}</strong></label>
            <input
              type="text"
              required
              className="text-input"
              value={selectedSize}
              onChange={(e) => setSelectedSize(e.target.value)}
              placeholder={t("selectedSizePlaceholder", lang)}
            />
          </div>

          <div className="field-block">
            <label><strong>{lang === "am" ? "የመረጡት ከለር *" : "Selected Color *"}</strong></label>
            <input
              type="text"
              required
              className="text-input"
              value={selectedColor}
              onChange={(e) => setSelectedColor(e.target.value)}
              placeholder={t("selectedColorPlaceholder", lang)}
            />
          </div>
        </div>

        <div className="field-block">
          <label><strong>{lang === "am" ? "ተጨማሪ ማስታወሻ" : "Procurement Instructions"}</strong></label>
          <textarea
            rows={2}
            className="text-input"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={t("notesPlaceholder", lang)}
          />
        </div>

        <button type="submit" className="btn-primary-action">
          ⚡ {t("calcQuoteBtn", lang)}
        </button>
      </form>

      {calculatedQuote && (
        <div className="quote-calculated-card">
          <h3>{productTitle || "Custom Shein Product"}</h3>
          <p className="quote-specs">
            Size: <strong>{selectedSize || "Standard"}</strong> | Color: <strong>{selectedColor || "As pictured"}</strong>
          </p>

          <div className="price-split-display">
            <div className="price-line total-price">
              <span>{t("totalLabel", lang)}:</span>
              <strong>{calculatedQuote.totalEtb.toLocaleString()} ETB</strong>
            </div>
            <div className="price-line deposit-highlight">
              <span>{t("depositLabel", lang)}:</span>
              <strong>{calculatedQuote.depositEtb.toLocaleString()} ETB</strong>
            </div>
            <div className="price-line cod-highlight">
              <span>{t("codLabel", lang)}:</span>
              <span>{calculatedQuote.codEtb.toLocaleString()} ETB</span>
            </div>
          </div>

          <button
            type="button"
            className="btn-success-action"
            onClick={handleConfirmAddToBag}
          >
            ✓ {t("submitQuoteBtn", lang)}
          </button>
        </div>
      )}
    </div>
  );
};
