// frontend/src/components/SheinSearchHero.tsx
import React, { useState } from "react";

interface SheinSearchHeroProps {
  onScrollToEstimator: () => void;
}

export const SheinSearchHero: React.FC<SheinSearchHeroProps> = ({
  onScrollToEstimator,
}) => {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchOnShein = (queryToUse?: string) => {
    const q = (queryToUse || searchQuery).trim();
    if (!q) {
      alert("እባክዎን የሚፈልጉትን የእቃ አይነት ይጻፉ (ለምሳሌ፦ ቀሚስ፣ ጫማ፣ ጃኬት...)");
      return;
    }

    const sheinSearchUrl = "https://www.shein.com/pdsearch/" + encodeURIComponent(q) + "/";

    if ((window as any).Telegram?.WebApp?.openLink) {
      (window as any).Telegram.WebApp.openLink(sheinSearchUrl);
    } else {
      window.open(sheinSearchUrl, "_blank", "noopener,noreferrer");
    }
  };

  const quickCategories = [
    { label: "👗 የሴቶች ቀሚሶች", query: "women dresses" },
    { label: "👔 የወንዶች ሸሚዝ", query: "men shirts" },
    { label: "👟 ስኒከር ጫማዎች", query: "sneakers shoes" },
    { label: "🧥 ጃኬቶችና ሁዲ", query: "jackets hoodies" },
    { label: "👜 ቦርሳዎች", query: "women handbags" },
    { label: "🔋 ፓወር ባንክ", query: "power bank usb-c" },
    { label: "🎧 የጆሮ ማዳመጫ", query: "wireless earbuds" },
    { label: "✨ የውበት መዋቢያዎች", query: "beauty skincare" },
  ];

  return (
    <section className="search-hero-section">
      <div className="hero-banner">
        <span className="hero-tag">🌟 የሼይን (SHEIN) እቃዎች መግዣና ማጓጓዣ</span>
        <h1 className="hero-title">ከሼይን (SHEIN) የሚፈልጉትን ማንኛውንም እቃ እዚህ ይፈልጉ</h1>
        <p className="hero-subtitle">
          የሚፈልጉትን እቃ በሼይን ድረ-ገጽ ላይ በቀጥታ ይምረጡ፣ ሊንኩን ይዘው ይምጡ — እኛ በ <strong>7-14 ቀናት</strong> ውስጥ አዲስ አበባ ደጃፍዎ እናደርሳለን!
        </p>
      </div>

      <div className="shein-search-card">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearchOnShein();
          }}
          className="search-form-row"
        >
          <div className="search-input-wrapper">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              className="shein-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="የሚፈልጉትን እቃ እዚህ ይጻፉ (ለምሳሌ፦ ቀሚስ፣ ስኒከር ጫማ፣ ፓወር ባንክ፣ ሁዲ...)"
            />
          </div>

          <button type="submit" className="btn-search-shein">
            በሼይን ፈልግ ↗
          </button>
        </form>

        <div className="quick-chips-wrapper">
          <span className="chips-label">ተወዳጅ ፍለጋዎች፦</span>
          <div className="chips-scroll">
            {quickCategories.map((c) => (
              <button
                key={c.query}
                type="button"
                className="category-chip-btn"
                onClick={() => handleSearchOnShein(c.query)}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="how-it-works-card">
        <h3>💡 ኮርቻ (Korcha) እንዴት ይሰራል?</h3>
        <div className="steps-grid">
          <div className="step-item">
            <div className="step-num">1</div>
            <div>
              <h4>በሼይን ይፈልጉና ይምረጡ</h4>
              <p>ከላይ ባለው መፈለጊያ የሚፈልጉትን እቃ በሼይን ድረ-ገጽ ላይ አይተው ይምረጡ።</p>
            </div>
          </div>

          <div className="step-item">
            <div className="step-num">2</div>
            <div>
              <h4>ሊንኩን ይዘው ይምጡ</h4>
              <p>የመረጡትን እቃ ሊንክ (Link) ኮፒ በማድረግ ከታች ባለው የዋጋ ማስያ ውስጥ ያስገቡ።</p>
            </div>
          </div>

          <div className="step-item">
            <div className="step-num">3</div>
            <div>
              <h4>የብር ዋጋውን አውቀው ያዝዙ</h4>
              <p>የብር ዋጋው በ 50% ጭማሪ ይሰላል፤ በ 25% ቅድመ ክፍያ ትዕዛዝዎ ይረጋገጣል!</p>
            </div>
          </div>
        </div>

        <button
          type="button"
          className="btn-jump-estimator"
          onClick={onScrollToEstimator}
        >
          👇 ወደ ዋጋ ማስያና ማዘዣው ውረድ
        </button>
      </div>
    </section>
  );
};
