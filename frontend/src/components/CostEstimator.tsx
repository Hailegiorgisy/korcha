// frontend/src/components/CostEstimator.tsx
import React, { useState } from "react";
import { QuotedProduct } from "../types";

interface CostEstimatorProps {
  onAddToCartAndCheckout: (product: QuotedProduct) => void;
}

export const CostEstimator: React.FC<CostEstimatorProps> = ({
  onAddToCartAndCheckout,
}) => {
  const [sheinUrl, setSheinUrl] = useState("");
  const [productTitle, setProductTitle] = useState("");
  const [usdPrice, setUsdPrice] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState("");

  const exchangeRate = 188.0;

  const parsedUsd = parseFloat(usdPrice);
  const isValidPrice = !isNaN(parsedUsd) && parsedUsd > 0;

  const unitTotalEtb = isValidPrice ? Math.round(parsedUsd * 1.50 * exchangeRate) : 0;
  const totalEtb = unitTotalEtb * quantity;
  const depositEtb = Math.round(totalEtb * 0.25);
  const codEtb = totalEtb - depositEtb;

  const handleAutoExtractTitle = (url: string) => {
    setSheinUrl(url);
    if (!productTitle) {
      try {
        const parsed = new URL(url.trim());
        const slug = parsed.pathname.split("/").filter(Boolean).pop() || "Shein Fashion Product";
        const cleaned = slug
          .replace(/-p-\d+.*$/i, "")
          .replace(/\.html?$/i, "")
          .replace(/[-_]/g, " ")
          .replace(/\b\w/g, (c) => c.toUpperCase());
        setProductTitle(cleaned);
      } catch {
        // ignore
      }
    }
  };

  const handleAgreeAndProceed = (e: React.FormEvent) => {
    e.preventDefault();

    if (!sheinUrl.trim()) {
      alert("እባክዎን የሼይን እቃ ሊንክ (Shein Link) ያስገቡ");
      return;
    }

    if (!isValidPrice) {
      alert("እባክዎን በሼይን ድረ-ገጽ ላይ ያዩትን ትክክለኛ የዶላር ዋጋ ($) ያስገቡ");
      return;
    }

    const item: QuotedProduct = {
      id: "korcha-order-" + Date.now(),
      sheinUrl: sheinUrl.trim(),
      title: productTitle.trim() || "የሼይን እቃ (Shein Item)",
      originalUsd: parsedUsd,
      priceEtb: unitTotalEtb,
      depositEtb: Math.round(unitTotalEtb * 0.25),
      codEtb: unitTotalEtb - Math.round(unitTotalEtb * 0.25),
      selectedSize: selectedSize.trim() || "መደበኛ (Standard)",
      selectedColor: selectedColor.trim() || "በፎቶው መሰረት (As Pictured)",
      customNotes: notes.trim(),
      quantity,
    };

    onAddToCartAndCheckout(item);
  };

  return (
    <section id="cost-estimator-section" className="estimator-section">
      <div className="section-header-box">
        <span className="badge-tag">📊 የዋጋ ማስያ እና ማዘዣ</span>
        <h2>የእቃዎን ሊንክ ያስገቡና የብር ዋጋውን ያሰሉ</h2>
        <p>በሼይን ላይ የመረጡትን እቃ ሊንክና የዶላር ዋጋ ያስገቡ። በ 50% ጭማሪ እና በ 188 የዶላር ምንዛሬ ትክክለኛ የብር ዋጋው ይሰላል።</p>
      </div>

      <form onSubmit={handleAgreeAndProceed} className="estimator-card-form">
        <div className="form-field-group">
          <label><strong>1. የሼይን እቃ ሊንክ (Shein Product URL) *</strong></label>
          <input
            type="url"
            required
            className="form-control-input"
            value={sheinUrl}
            onChange={(e) => handleAutoExtractTitle(e.target.value)}
            placeholder="https://www.shein.com/product-..."
          />
        </div>

        <div className="form-field-group">
          <label><strong>2. የእቃው ስም ወይም መግለጫ (አስፈላጊ ከሆነ)</strong></label>
          <input
            type="text"
            className="form-control-input"
            value={productTitle}
            onChange={(e) => setProductTitle(e.target.value)}
            placeholder="ለምሳሌ፦ Elegant Chiffon Maxi Dress"
          />
        </div>

        <div className="form-row-grid">
          <div className="form-field-group">
            <label><strong>3. በሼይን ላይ ያለው ዋጋ ($ USD) *</strong></label>
            <input
              type="number"
              step="0.01"
              required
              className="form-control-input"
              value={usdPrice}
              onChange={(e) => setUsdPrice(e.target.value)}
              placeholder="ለምሳሌ፦ 15.00"
            />
          </div>

          <div className="form-field-group">
            <label><strong>ብዛት (Quantity)</strong></label>
            <input
              type="number"
              min="1"
              max="20"
              className="form-control-input"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value || "1", 10)))}
            />
          </div>
        </div>

        <div className="form-row-grid">
          <div className="form-field-group">
            <label><strong>የመረጡት መጠን (Size)</strong></label>
            <input
              type="text"
              className="form-control-input"
              value={selectedSize}
              onChange={(e) => setSelectedSize(e.target.value)}
              placeholder="ለምሳሌ፦ S, M, L, XL, 40..."
            />
          </div>

          <div className="form-field-group">
            <label><strong>የመረጡት ቀለም (Color)</strong></label>
            <input
              type="text"
              className="form-control-input"
              value={selectedColor}
              onChange={(e) => setSelectedColor(e.target.value)}
              placeholder="ለምሳሌ፦ ጥቁር፣ ቀይ፣ ነጭ..."
            />
          </div>
        </div>

        <div className="form-field-group">
          <label><strong>ተጨማሪ ማስታወሻ ለሰራተኞቻችን (ካለዎት)</strong></label>
          <textarea
            rows={2}
            className="form-control-input"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="ስለ እቃው ማስተላለፍ የሚፈልጉት ልዩ መልእክት ካለ እዚህ ይጻፉ..."
          />
        </div>

        {isValidPrice ? (
          <div className="calculated-cost-display animated-cost">
            <div className="cost-row-main">
              <span>ጠቅላላ የብር ዋጋ (Total Landed Cost):</span>
              <span className="main-price-etb">{totalEtb.toLocaleString()} ብር</span>
            </div>

            <div className="cost-breakdown-details">
              <div className="detail-pill deposit-pill">
                <span>የ 25% ቅድመ ክፍያ (Deposit):</span>
                <strong>{depositEtb.toLocaleString()} ብር</strong>
              </div>

              <div className="detail-pill cod-pill">
                <span>ቀሪ 75% ሲደርስ የሚከፈል (COD):</span>
                <strong>{codEtb.toLocaleString()} ብር</strong>
              </div>
            </div>

            <p className="rate-formula-hint">
              * ስሌቱ፦ (${parsedUsd.toFixed(2)} + 50% የማስመጫና የቀረጥ ጭማሪ) × 188.0 የምንዛሬ ተመን።
            </p>

            <button type="submit" className="btn-confirm-agree">
              ✓ በዋጋው ተስማምቻለሁ — በ 25% ቅድመ ክፍያ እዘዝ &rarr;
            </button>
          </div>
        ) : (
          <div className="price-prompt-tip">
            👉 እባክዎን ከላይ የእቃውን የዶላር ዋጋ ($) ሲያስገቡ የብር ዋጋው እና የ 25% ቅድመ ክፍያው በራሱ ይሰላል።
          </div>
        )}
      </form>
    </section>
  );
};
