// frontend/src/components/Header.tsx
import React from "react";

interface HeaderProps {
  cartCount: number;
  onOpenCart: () => void;
  onOpenHelp: () => void;
  currentView: "home" | "checkout" | "dispatch";
  onNavigate: (view: "home" | "dispatch") => void;
}

export const Header: React.FC<HeaderProps> = ({
  cartCount,
  onOpenCart,
  onOpenHelp,
  currentView,
  onNavigate,
}) => {
  return (
    <header className="korcha-header">
      <div className="header-top-row">
        <div className="brand-lockup" onClick={() => onNavigate("home")}>
          <span className="brand-logo-text">KORCHA</span>
          <span className="brand-badge-am">ኮርቻ</span>
        </div>

        <div className="header-actions">
          {/* Help Button */}
          <button
            type="button"
            className="btn-help-pill"
            onClick={onOpenHelp}
            title="የደንበኞች ድጋፍና እርዳታ"
          >
            ❓ እርዳታ
          </button>

          {/* Dispatcher View Link */}
          <button
            type="button"
            className={`btn-dispatch-pill ${currentView === "dispatch" ? "active" : ""}`}
            onClick={() => onNavigate(currentView === "dispatch" ? "home" : "dispatch")}
          >
            🚚 {currentView === "dispatch" ? "ዋና ገጽ" : "አስተላላፊ"}
          </button>

          {/* Cart Bubble */}
          <button
            type="button"
            className="btn-cart-bubble"
            onClick={onOpenCart}
            aria-label="የግዢ ቅርጫት"
          >
            🛍️
            {cartCount > 0 && <span className="cart-badge-count">{cartCount}</span>}
          </button>
        </div>
      </div>
    </header>
  );
};
