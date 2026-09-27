// frontend/src/components/Header.tsx
import React from "react";
import { Language } from "../types";
import { t } from "../utils/translations";

interface HeaderProps {
  lang: Language;
  onToggleLang: () => void;
  cartCount: number;
  onOpenCart: () => void;
  currentView: "catalog" | "quote" | "checkout" | "dispatch";
  onNavigate: (view: "catalog" | "quote" | "dispatch") => void;
}

export const Header: React.FC<HeaderProps> = ({
  lang,
  onToggleLang,
  cartCount,
  onOpenCart,
  currentView,
  onNavigate,
}) => {
  return (
    <header className="korcha-header">
      <div className="header-top-row">
        <div className="brand-lockup" onClick={() => onNavigate("catalog")}>
          <span className="brand-title">KORCHA</span>
          <span className="brand-badge-am">ኮርቻ</span>
        </div>

        <div className="header-ctrls">
          <button
            type="button"
            className="btn-lang-toggle"
            onClick={onToggleLang}
            title="Switch Language"
          >
            {t("langToggle", lang)}
          </button>

          <button
            type="button"
            className="btn-cart-bubble"
            onClick={onOpenCart}
            aria-label="Shopping Bag"
          >
            🛍️
            {cartCount > 0 && <span className="bubble-count">{cartCount}</span>}
          </button>
        </div>
      </div>

      {/* Nav pill tabs */}
      <nav className="header-nav-tabs">
        <button
          type="button"
          className={`nav-tab-btn ${currentView === "catalog" ? "active" : ""}`}
          onClick={() => onNavigate("catalog")}
        >
          🏷️ {t("catalogTab", lang)}
        </button>

        <button
          type="button"
          className={`nav-tab-btn ${currentView === "quote" ? "active" : ""}`}
          onClick={() => onNavigate("quote")}
        >
          📝 {t("quoteTab", lang)}
        </button>

        <button
          type="button"
          className={`nav-tab-btn ${currentView === "dispatch" ? "active" : ""}`}
          onClick={() => onNavigate("dispatch")}
        >
          🚚 {t("dispatchTab", lang)}
        </button>
      </nav>
    </header>
  );
};
