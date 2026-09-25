// frontend/src/components/Header.tsx
import React from "react";
import { Language } from "../types";
import { t } from "../utils/translations";

interface HeaderProps {
  lang: Language;
  onToggleLang: () => void;
  cartCount: number;
  onOpenCart: () => void;
  currentView: "shop" | "cart" | "checkout" | "dispatch";
  onNavigate: (view: "shop" | "dispatch") => void;
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
    <header className="app-header">
      <div className="header-top">
        <div className="brand" onClick={() => onNavigate("shop")}>
          <span className="brand-logo">SHEIN</span>
          <span className="brand-sub">ET</span>
        </div>

        <div className="header-actions">
          {/* Dispatcher toggle */}
          <button
            type="button"
            className={`btn-pill ${currentView === "dispatch" ? "active" : ""}`}
            onClick={() => onNavigate(currentView === "dispatch" ? "shop" : "dispatch")}
          >
            {currentView === "dispatch" ? "🛍️ Shop" : "🚚 Dispatch"}
          </button>

          {/* Language Toggle: English <-> Amharic */}
          <button type="button" className="btn-lang" onClick={onToggleLang}>
            {t("langToggle", lang)}
          </button>

          {/* Cart Icon */}
          <button type="button" className="btn-cart" onClick={onOpenCart}>
            🛍️
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </button>
        </div>
      </div>
    </header>
  );
};
