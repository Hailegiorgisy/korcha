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

  const totalEtb = cart.reduce((sum, item) => sum + item.product.priceEtb * item.quantity, 0);
  const depositEtb = Math.round(totalEtb * 0.25);
  const codEtb = totalEtb - depositEtb;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="cart-drawer-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-header-row">
          <h3>{t("cartTitle", lang)} ({cart.length})</h3>
          <button type="button" className="btn-modal-close" onClick={onClose}>✕</button>
        </div>

        {cart.length === 0 ? (
          <div className="empty-cart-state">
            <p>{t("emptyCart", lang)}</p>
          </div>
        ) : (
          <>
            <div className="cart-scroll-items">
              {cart.map((item) => (
                <div key={item.product.id} className="cart-row-item">
                  <img src={item.product.imageUrl} alt={item.product.name} className="cart-row-img" />
                  <div className="cart-row-body">
                    <h4>{lang === "am" && item.product.nameAm ? item.product.nameAm : item.product.name}</h4>
                    {(item.selectedSize || item.selectedColor) && (
                      <p className="cart-variant-tag">
                        Size: {item.selectedSize || "-"} | Color: {item.selectedColor || "-"}
                      </p>
                    )}
                    <p className="cart-row-price">{(item.product.priceEtb * item.quantity).toLocaleString()} ETB</p>
                    <div className="cart-qty-ctrls">
                      <button type="button" onClick={() => onUpdateQuantity(item.product.id, -1)}>-</button>
                      <span>{item.quantity}</span>
                      <button type="button" onClick={() => onUpdateQuantity(item.product.id, 1)}>+</button>
                      <button type="button" className="btn-remove-item" onClick={() => onRemoveItem(item.product.id)}>🗑️</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Split Price Summary */}
            <div className="cart-totals-summary">
              <div className="summary-total-line">
                <span>{t("totalLabel", lang)}:</span>
                <strong>{totalEtb.toLocaleString()} ETB</strong>
              </div>
              <div className="summary-split-line deposit">
                <span>{t("depositLabel", lang)}:</span>
                <strong>{depositEtb.toLocaleString()} ETB</strong>
              </div>
              <div className="summary-split-line cod">
                <span>{t("codLabel", lang)}:</span>
                <span>{codEtb.toLocaleString()} ETB</span>
              </div>
            </div>

            <button type="button" className="btn-proceed-checkout" onClick={onProceedToCheckout}>
              {t("checkoutBtn", lang)} &rarr;
            </button>
          </>
        )}
      </div>
    </div>
  );
};
