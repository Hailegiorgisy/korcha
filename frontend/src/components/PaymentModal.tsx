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
  onConfirmPayment: (telebirrTxnId: string) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  totalEtb,
  depositEtb,
  codEtb,
  lang,
  onCancel,
  onConfirmPayment,
}) => {
  // Telebirr Receiver phone linkage
  const receiverPhone = "+251 91 123 4567";
  const receiverName = "Korcha Logistics (ኮርቻ ሎጂስቲክስ)";
  const orderRef = "REF-" + Math.floor(100000 + Math.random() * 900000);

  const [transactionId, setTransactionId] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!transactionId.trim()) {
      alert(lang === "am" ? "እባክዎን የቴሌብር ትራንዛክሽን ቁጥር ያስገቡ" : "Please input Telebirr transaction ID");
      return;
    }

    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      onConfirmPayment(transactionId.trim());
    }, 1000);
  };

  return (
    <div className="modal-backdrop">
      <div className="telebirr-modal-sheet">
        <div className="telebirr-modal-header">
          <span className="telebirr-badge-logo">🟢 TELEBIRR PAY</span>
          <button type="button" className="btn-modal-close" onClick={onCancel}>✕</button>
        </div>

        <p className="telebirr-desc">{t("telebirrInstruction", lang)}</p>

        {/* Receiver Card Linkage */}
        <div className="telebirr-receiver-card">
          <div className="receiver-item">
            <span>{t("receiverPhoneLabel", lang)}:</span>
            <strong>{receiverPhone}</strong>
          </div>
          <div className="receiver-item">
            <span>{t("receiverNameLabel", lang)}:</span>
            <strong>{receiverName}</strong>
          </div>
          <div className="receiver-item">
            <span>Order Reference:</span>
            <strong className="ref-tag">{orderRef}</strong>
          </div>
        </div>

        {/* Deposit Split Callout */}
        <div className="deposit-highlight-card">
          <span>{t("depositDueLabel", lang)}:</span>
          <h2 className="deposit-amount-etb">{depositEtb.toLocaleString()} ETB</h2>
          <small>{t("codLabel", lang)}: <strong>{codEtb.toLocaleString()} ETB</strong></small>
        </div>

        <form onSubmit={handleSubmit} className="telebirr-verify-form">
          <div className="field-group">
            <label><strong>{lang === "am" ? "የቴሌብር ትራንዛክሽን ቁጥር (Transaction ID)" : "Telebirr Transaction ID / Code *"}</strong></label>
            <input
              type="text"
              required
              className="text-input"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              placeholder={t("txnIdPlaceholder", lang)}
            />
          </div>

          <button type="submit" className="btn-telebirr-confirm" disabled={submitting}>
            {submitting ? "Verifying..." : t("confirmTelebirrBtn", lang)}
          </button>
        </form>
      </div>
    </div>
  );
};
