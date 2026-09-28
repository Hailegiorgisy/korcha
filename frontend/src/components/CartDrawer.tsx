// frontend/src/components/CartDrawer.tsx
import React from "react";
import { QuotedProduct } from "../types";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: QuotedProduct[];
  onRemoveItem: (id: string) => void;
  onProceedToCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cart,
  onRemoveItem,
  onProceedToCheckout,
}) => {
  if (!isOpen) return null;

  const totalEtb = cart.reduce((sum, item) => sum + item.priceEtb * item.quantity, 0);
  const depositEtb = Math.round(totalEtb * 0.25);
  const codEtb = totalEtb - depositEtb;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="cart-drawer-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-header-row">
          <h3>🛍️ የግዢ ቅርጫት ({cart.length})</h3>
          <button type="button" className="btn-modal-close" onClick={onClose}>✕</button>
        </div>

        {cart.length === 0 ? (
          <div className="empty-cart-state">
            <p>ቅርጫትዎ ባዶ ነው። እባክዎ ከላይ ያለውን የዋጋ ማስያ በመጠቀም እቃ ይዘዙ!</p>
          </div>
        ) : (
          <>
            <div className="cart-scroll-items">
              {cart.map((item) => (
                <div key={item.id} className="cart-row-item">
                  <div className="cart-row-body">
                    <h4>{item.title}</h4>
                    <p className="cart-variant-tag">
                      መጠን፦ {item.selectedSize} | ቀለም፦ {item.selectedColor} | ብዛት፦ {item.quantity}
                    </p>
                    <p className="cart-row-price">{(item.priceEtb * item.quantity).toLocaleString()} ብር</p>
                    <div className="cart-link-ref">
                      <a href={item.sheinUrl} target="_blank" rel="noopener noreferrer">
                        🔗 የሼይን ሊንክ ይመልከቱ
                      </a>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="btn-remove-item"
                    onClick={() => onRemoveItem(item.id)}
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>

            <div className="cart-totals-summary">
              <div className="summary-total-line">
                <span>ጠቅላላ የብር ዋጋ፦</span>
                <strong>{totalEtb.toLocaleString()} ብር</strong>
              </div>
              <div className="summary-split-line deposit">
                <span>የ 25% ቅድመ ክፍያ፦</span>
                <strong>{depositEtb.toLocaleString()} ብር</strong>
              </div>
              <div className="summary-split-line cod">
                <span>ቀሪ 75% ሲደርስ የሚከፈል፦</span>
                <span>{codEtb.toLocaleString()} ብር</span>
              </div>
            </div>

            <button type="button" className="btn-proceed-checkout" onClick={onProceedToCheckout}>
              ወደ ማድረሻ አድራሻ ይቀጥሉ &rarr;
            </button>
          </>
        )}
      </div>
    </div>
  );
};
