// frontend/src/components/PaymentModal.tsx
import React, { useState } from "react";
import { Language } from "../types";
import { t } from "../utils/translations";

interface PaymentModalProps {
  totalEtb: number;
  depositEtb: number;
  codEtb: number;
  lang: Language;
  onCancel: () => void;
  onConfirmPayment: (method: string) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  totalEtb,
  depositEtb,
  codEtb,
  lang,
  onCancel,
  onConfirmPayment,
}) => {
  const [selectedMethod, setSelectedMethod] = useState("telebirr");
  const [processing, setProcessing] = useState(false);

  const handlePay = () => {
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      onConfirmPayment(selectedMethod);
    }, 1200);
  };

  return (
    <div className="modal-overlay">
      <div className="chapa-modal">
        <div className="chapa-header">
          <span className="chapa-logo">⚡ CHAPA</span>
          <span className="chapa-badge">Simulated Checkout</span>
        </div>

        <div className="chapa-body">
          <p className="chapa-instruction">{t("depositNote", lang)}</p>

          {/* Deposit Highlights */}
          <div className="deposit-callout">
            <div>
              <span className="callout-label">{t("depositDue", lang)}</span>
              <h2 className="callout-amount">{depositEtb.toLocaleString()} ETB</h2>
            </div>
            <div className="callout-sub">
              <span>{t("codDue", lang)}:</span>
              <strong>{codEtb.toLocaleString()} ETB</strong>
            </div>
          </div>

          {/* Payment Method Selectors */}
          <div className="payment-options">
            <label className={`payment-card ${selectedMethod === "telebirr" ? "active" : ""}`}>
              <input
                type="radio"
                name="pm"
                value="telebirr"
                checked={selectedMethod === "telebirr"}
                onChange={() => setSelectedMethod("telebirr")}
              />
              <span className="pm-icon">🟢</span>
              <span className="pm-name">{t("payWithTelebirr", lang)}</span>
            </label>

            <label className={`payment-card ${selectedMethod === "cbe" ? "active" : ""}`}>
              <input
                type="radio"
                name="pm"
                value="cbe"
                checked={selectedMethod === "cbe"}
                onChange={() => setSelectedMethod("cbe")}
              />
              <span className="pm-icon">🟣</span>
              <span className="pm-name">{t("payWithCbe", lang)}</span>
            </label>

            <label className={`payment-card ${selectedMethod === "mpesa" ? "active" : ""}`}>
              <input
                type="radio"
                name="pm"
                value="mpesa"
                checked={selectedMethod === "mpesa"}
                onChange={() => setSelectedMethod("mpesa")}
              />
              <span className="pm-icon">🔴</span>
              <span className="pm-name">{t("payWithMpesa", lang)}</span>
            </label>
          </div>

          <div className="chapa-actions">
            <button
              type="button"
              className="btn-chapa-confirm"
              onClick={handlePay}
              disabled={processing}
            >
              {processing ? "Processing..." : t("confirmPayment", lang)}
            </button>
            <button type="button" className="btn-chapa-cancel" onClick={onCancel}>
              {lang === "am" ? "ሰርዝ" : "Cancel"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
