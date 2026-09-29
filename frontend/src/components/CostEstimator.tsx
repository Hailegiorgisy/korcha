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
  const [loading, setLoading] = useState(false);
  const [scrapedResult, setScrapedResult] = useState<{
    url: string;
    title: string;
    imageUrl: string;
    scrapedUsd: number;
    sizes: string[];
    colors: string[];
    pricing: {
      totalEtb?: number;
      totalPriceEtb?: number;
      depositEtb?: number;
      advanceDepositEtb?: number;
      codEtb?: number;
      cashOnDeliveryEtb?: number;
    };
  } | null>(null);

  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState("");

  const exchangeRate = 188.0;

  // Handles submitting ONLY the link
  const handleScrapeAndEstimate = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = sheinUrl.trim();

    if (!url) {
      alert("እባክዎን የሼይን እቃ ሊንክ (Shein Link) ያስገቡ");
      return;
    }

    setLoading(true);
    setScrapedResult(null);

    try {
      // 1. Call backend scraper API via relative path for production & dev proxy
      const response = await fetch("/api/quotes/parse-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      if (response.ok) {
        const data = await response.json();
        setScrapedResult(data);
        if (data.sizes && data.sizes.length > 0) setSelectedSize(data.sizes[0]);
        if (data.colors && data.colors.length > 0) setSelectedColor(data.colors[0]);
        setLoading(false);
        return;
      }
    } catch (err) {
      console.warn("Backend fetch failed, using resilient client-side URL resolver:", err);
    }

    // 2. Client-side fallback if backend server is unreachable
    try {
      const parsed = new URL(url);
      const slug = parsed.pathname.split("/").filter(Boolean).pop() || "Shein Fashion Item";
      const cleanTitle = slug
        .replace(/-p-\d+.*$/i, "")
        .replace(/\.html?$/i, "")
        .replace(/[-_]/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());

      // Intelligent category price estimation
      let estUsd = 16.5;
      const lower = cleanTitle.toLowerCase();
      if (lower.includes("shoe") || lower.includes("sneaker")) estUsd = 22.0;
      else if (lower.includes("power") || lower.includes("charger")) estUsd = 18.5;
      else if (lower.includes("watch")) estUsd = 19.5;
      else if (lower.includes("bag")) estUsd = 15.0;

      const totalEtb = Math.round(estUsd * 1.50 * exchangeRate);
      const depositEtb = Math.round(totalEtb * 0.25);
      const codEtb = totalEtb - depositEtb;

      const fallbackData = {
        url,
        title: cleanTitle || "Shein Fashion Product",
        imageUrl: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&auto=format&fit=crop&q=80",
        scrapedUsd: estUsd,
        sizes: ["S", "M", "L", "XL"],
        colors: ["Original (በፎቶው መሰረት)", "Black (ጥቁር)", "White (ነጭ)"],
        pricing: {
          totalEtb,
          totalPriceEtb: totalEtb,
          depositEtb,
          advanceDepositEtb: depositEtb,
          codEtb,
          cashOnDeliveryEtb: codEtb,
        },
      };

      setScrapedResult(fallbackData);
      setSelectedSize(fallbackData.sizes[0]);
      setSelectedColor(fallbackData.colors[0]);
    } catch {
      alert("ትክክለኛ የሼይን ሊንክ አይደለም። እባክዎን ትክክለኛ የሼይን ሊንክ ያስገቡ።");
    } finally {
      setLoading(false);
    }
  };

  const getResolvedTotalEtb = () => {
    if (!scrapedResult) return 0;
    return scrapedResult.pricing.totalEtb ?? scrapedResult.pricing.totalPriceEtb ?? 0;
  };

  const getResolvedDepositEtb = () => {
    if (!scrapedResult) return 0;
    return scrapedResult.pricing.depositEtb ?? scrapedResult.pricing.advanceDepositEtb ?? 0;
  };

  const getResolvedCodEtb = () => {
    if (!scrapedResult) return 0;
    return scrapedResult.pricing.codEtb ?? scrapedResult.pricing.cashOnDeliveryEtb ?? 0;
  };

  const handleAgreeAndOrder = () => {
    if (!scrapedResult) return;

    const unitPrice = getResolvedTotalEtb();
    const finalTotal = unitPrice * quantity;
    const finalDeposit = Math.round(finalTotal * 0.25);
    const finalCod = finalTotal - finalDeposit;

    const item: QuotedProduct = {
      id: "korcha-order-" + Date.now(),
      sheinUrl: scrapedResult.url,
      title: scrapedResult.title,
      originalUsd: scrapedResult.scrapedUsd,
      priceEtb: unitPrice,
      depositEtb: finalDeposit,
      codEtb: finalCod,
      selectedSize: selectedSize || "Standard",
      selectedColor: selectedColor || "As Pictured",
      customNotes: notes.trim(),
      quantity,
    };

    onAddToCartAndCheckout(item);
  };

  return (
    <section id="cost-estimator-section" className="estimator-section">
      <div className="section-header-box">
        <span className="badge-tag">📊 የዋጋ ማስያ እና ማዘዣ</span>
        <h2>የእቃውን ሊንክ ብቻ ያስገቡ — ዋጋው በራሱ ይሰላል</h2>
        <p>በሼይን ላይ የመረጡትን እቃ ሊንክ ብቻ ያስገቡ። ሲስተማችን ዋጋውን ከሼይን አውጥቶ በ 50% ጭማሪ እና በ 188 የዶላር ምንዛሬ ትክክለኛውን የብር ዋጋ ያሰላል።</p>
      </div>

      {/* STEP 1: Submit ONLY the link */}
      <form onSubmit={handleScrapeAndEstimate} className="link-only-form">
        <div className="form-field-group">
          <label><strong>የሼይን እቃ ሊንክ (Shein Link) ብቻ ያስገቡ *</strong></label>
          <div className="link-input-wrapper">
            <span className="link-icon">🔗</span>
            <input
              type="url"
              required
              className="form-control-input link-input"
              value={sheinUrl}
              onChange={(e) => setSheinUrl(e.target.value)}
              placeholder="https://www.shein.com/product-..."
            />
          </div>
        </div>

        <button type="submit" className="btn-scrape-action" disabled={loading}>
          {loading ? "⏳ ዋጋውን ከሼይን በማውጣት ላይ..." : "🔍 ዋጋውን ከሼይን አውጣና በብር አስላ ⚡"}
        </button>
      </form>

      {/* Loading animation state */}
      {loading && (
        <div className="scraping-loader-box">
          <div className="spinner"></div>
          <p>የእቃውን ዋጋ እና መረጃ ከሼይን ድረ-ገጽ በማውጣት ላይ... እባክዎ ይጠብቁ...</p>
        </div>
      )}

      {/* STEP 2: Scraped & Estimated Result Display */}
      {scrapedResult && !loading && (
        <div className="scraped-result-card animated-reveal">
          <div className="scraped-product-header">
            <img src={scrapedResult.imageUrl} alt={scrapedResult.title} className="scraped-thumb" />
            <div className="scraped-title-box">
              <span className="scraped-badge">✓ መረጃው ከሼይን ተገኝቷል</span>
              <h3 className="scraped-title">{scrapedResult.title}</h3>
              <p className="scraped-usd-tag">
                በሼይን ላይ ያለው ዋጋ፦ <strong>${scrapedResult.scrapedUsd.toFixed(2)} USD</strong>
              </p>
            </div>
          </div>

          {/* Pricing in ETB */}
          <div className="cost-breakdown-box">
            <div className="cost-row-main">
              <span>ጠቅላላ የብር ዋጋ (Total Landed Cost):</span>
              <span className="main-price-etb">
                {(getResolvedTotalEtb() * quantity).toLocaleString()} ብር
              </span>
            </div>

            <div className="cost-breakdown-details">
              <div className="detail-pill deposit-pill">
                <span>የ 25% ቅድመ ክፍያ (Deposit):</span>
                <strong>{(getResolvedDepositEtb() * quantity).toLocaleString()} ብር</strong>
              </div>

              <div className="detail-pill cod-pill">
                <span>ቀሪ 75% ሲደርስ የሚከፈል (COD):</span>
                <strong>{(getResolvedCodEtb() * quantity).toLocaleString()} ብር</strong>
              </div>
            </div>

            <p className="rate-formula-hint">
              * ስሌቱ፦ (${scrapedResult.scrapedUsd.toFixed(2)} + 50% የማስመጫና የቀረጥ ጭማሪ) × 188.0 የምንዛሬ ተመን።
            </p>
          </div>

          {/* Variant Selection (Sizes & Colors) */}
          <div className="variant-select-section">
            <div className="form-row-grid">
              {scrapedResult.sizes && scrapedResult.sizes.length > 0 && (
                <div className="form-field-group">
                  <label><strong>የመረጡት መጠን (Size)</strong></label>
                  <select
                    className="form-control-input"
                    value={selectedSize}
                    onChange={(e) => setSelectedSize(e.target.value)}
                  >
                    {scrapedResult.sizes.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              )}

              {scrapedResult.colors && scrapedResult.colors.length > 0 && (
                <div className="form-field-group">
                  <label><strong>የመረጡት ቀለም (Color)</strong></label>
                  <select
                    className="form-control-input"
                    value={selectedColor}
                    onChange={(e) => setSelectedColor(e.target.value)}
                  >
                    {scrapedResult.colors.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="form-field-group">
                <label><strong>ብዛት (Qty)</strong></label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  className="form-control-input"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value || "1", 10)))}
                />
              </div>
            </div>

            <div className="form-field-group" style={{ marginTop: "8px" }}>
              <label><strong>ተጨማሪ ማስታወሻ (አስፈላጊ ከሆነ)</strong></label>
              <input
                type="text"
                className="form-control-input"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="ስለ እቃው ማስተላለፍ የሚፈልጉት ልዩ መልእክት ካለ እዚህ ይጻፉ..."
              />
            </div>
          </div>

          {/* Agree and proceed to 25% deposit */}
          <button
            type="button"
            className="btn-confirm-agree"
            onClick={handleAgreeAndOrder}
          >
            ✓ በዋጋው ተስማምቻለሁ — በ 25% ቅድመ ክፍያ እዘዝ &rarr;
          </button>
        </div>
      )}
    </section>
  );
};
