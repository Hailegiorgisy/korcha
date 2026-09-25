// frontend/src/components/CartDrawer.tsx
import React from "react";
import { CartItem, Language } from "../types";
import { t } from "../utils/translations";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  lang: Language;
  onUpdateQuantity: (productId: string, delta: number) => void;
  onRemoveItem: (productId: string) => void;
  onProceedToCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cart,
  lang,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout,
}) => {
  if (!isOpen) return null;

  const totalEtb = cart.reduce(
    (sum, item) => sum + item.product.priceEtb * item.quantity,
    0
  );
  const depositEtb = Math.round(totalEtb * 0.25);
  const codEtb = totalEtb - depositEtb;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="drawer-content" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-header">
          <h3>{t("cartTitle", lang)} ({cart.length})</h3>
          <button type="button" className="btn-close" onClick={onClose}>
            ✕
          </button>
        </div>

        {cart.length === 0 ? (
          <div className="empty-cart-view">
            <p>{t("emptyCart", lang)}</p>
          </div>
        ) : (
          <>
            <div className="cart-items-list">
              {cart.map((item) => (
                <div key={item.product.id} className="cart-item-row">
                  <img
                    src={item.product.imageUrl}
                    alt={item.product.name}
                    className="cart-thumb"
                  />
                  <div className="cart-item-info">
                    <h4>{lang === "am" && item.product.nameAm ? item.product.nameAm : item.product.name}</h4>
                    <p className="item-price">
                      {(item.product.priceEtb * item.quantity).toLocaleString()} ETB
                    </p>
                    <div className="qty-controls">
                      <button
                        type="button"
                        onClick={() => onUpdateQuantity(item.product.id, -1)}
                      >
                        -
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => onUpdateQuantity(item.product.id, 1)}
                      >
                        +
                      </button>
                      <button
                        type="button"
                        className="btn-trash"
                        onClick={() => onRemoveItem(item.product.id)}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Split Price Summary */}
            <div className="cart-summary-box">
              <div className="summary-row total-row">
                <span>{t("totalLabel", lang)}:</span>
                <strong>{totalEtb.toLocaleString()} ETB</strong>
              </div>
              <div className="summary-row deposit-row">
                <span>{t("depositDue", lang)}:</span>
                <span className="badge-dep">{depositEtb.toLocaleString()} ETB</span>
              </div>
              <div className="summary-row cod-row">
                <span>{t("codDue", lang)}:</span>
                <span>{codEtb.toLocaleString()} ETB</span>
              </div>
            </div>

            <div className="drawer-footer">
              <button
                type="button"
                className="btn-checkout-primary"
                onClick={onProceedToCheckout}
              >
                {t("checkoutBtn", lang)} &rarr;
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
