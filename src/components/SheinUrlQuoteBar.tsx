// frontend/src/components/SheinUrlQuoteBar.tsx
import React, { useState } from "react";
import { Language, Product } from "../types";
import { t } from "../utils/translations";

interface SheinUrlQuoteBarProps {
  lang: Language;
  onAddParsedProduct: (product: Product) => void;
}

export const SheinUrlQuoteBar: React.FC<SheinUrlQuoteBarProps> = ({
  lang,
  onAddParsedProduct,
}) => {
  const [url, setUrl] = useState("");
  const [manualPrice, setManualPrice] = useState("");
  const [loading, setLoading] = useState(false);
  const [quoteResult, setQuoteResult] = useState<any>(null);

  const handleCalculate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setLoading(true);
    setQuoteResult(null);

    try {
      // Direct client-side parsing fallback if backend is offline
      const parsedUrl = new URL(url.trim());
      const pathSegments = parsedUrl.pathname.split("/").filter(Boolean);
      const slug = pathSegments[pathSegments.length - 1] || "shein-product";
      const cleanTitle = slug
        .replace(/-p-\d+.*$/i, "")
        .replace(/\.html?$/i, "")
        .replace(/[-_]/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());

      const usd = manualPrice ? parseFloat(manualPrice) : 19.99;
      const rate = 125.0;
      const markedUpUsd = Number((usd * 1.5).toFixed(2));
      const totalEtb = Math.round(markedUpUsd * rate);
      const depositEtb = Math.round(totalEtb * 0.25);
      const codEtb = totalEtb - depositEtb;

      setQuoteResult({
        title: cleanTitle || "Shein Item",
        usdPrice: usd,
        totalEtb,
        depositEtb,
        codEtb,
        url: url.trim(),
      });
    } catch {
      alert(lang === "am" ? "እባክዎን ትክክለኛ የሼይን ሊንክ ያስገቡ" : "Please enter a valid URL");
    } finally {
      setLoading(false);
    }
  };

  const handleAddToBag = () => {
    if (!quoteResult) return;

    const newProd: Product = {
      id: "shein-custom-" + Date.now(),
      name: quoteResult.title,
      category: "clothes",
      priceEtb: quoteResult.totalEtb,
      originalUsd: quoteResult.usdPrice,
      imageUrl: "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=600&auto=format&fit=crop&q=80",
      sheinUrl: quoteResult.url,
      badge: "HOT",
      inStock: true,
    };

    onAddParsedProduct(newProd);
    setQuoteResult(null);
    setUrl("");
    setManualPrice("");
  };

  return (
    <div className="quote-bar-container">
      <div className="quote-header">
        <h4>🔗 {t("pasteTitle", lang)}</h4>
      </div>

      <form onSubmit={handleCalculate} className="quote-form">
        <input
          type="url"
          className="quote-input"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder={t("pastePlaceholder", lang)}
          required
        />

        <div className="quote-sub-row">
          <input
            type="number"
            step="0.01"
            className="quote-price-input"
            value={manualPrice}
            onChange={(e) => setManualPrice(e.target.value)}
            placeholder="USD Price ($) (optional)"
          />
          <button type="submit" className="btn-shein" disabled={loading}>
            {loading ? t("calculating", lang) : t("calcBtn", lang)}
          </button>
        </div>
      </form>

      {quoteResult && (
        <div className="quote-result-card">
          <div className="quote-info">
            <strong>{quoteResult.title}</strong>
            <div className="quote-breakdown">
              <span>Shein: ${quoteResult.usdPrice.toFixed(2)} (+50% fee)</span>
              <span className="price-tag">{quoteResult.totalEtb.toLocaleString()} ETB</span>
            </div>
            <div className="quote-split">
              <small>💵 25% Deposit: <strong>{quoteResult.depositEtb.toLocaleString()} ETB</strong></small>
              <small>📦 75% COD: <strong>{quoteResult.codEtb.toLocaleString()} ETB</strong></small>
            </div>
          </div>
          <button type="button" className="btn-add-quote" onClick={handleAddToBag}>
            + {t("addToBag", lang)}
          </button>
        </div>
      )}
    </div>
  );
};
