// frontend/src/components/PaymentModal.tsx
import React, { useState } from "react";

interface PaymentModalProps {
  totalEtb: number;
  depositEtb: number;
  codEtb: number;
  onCancel: () => void;
  onConfirmOrder: (paymentOption: "Deposit25" | "NoAdvancePayment", telebirrTxnId?: string) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  totalEtb,
  depositEtb,
  codEtb,
  onCancel,
  onConfirmOrder,
}) => {
  const [chosenOption, setChosenOption] = useState<"Deposit25" | "NoAdvancePayment">("Deposit25");
  const [transactionId, setTransactionId] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const receiverPhone = "+251 91 123 4567";
  const receiverName = "Korcha Logistics (ኮርቻ ሎጂስቲክስ)";
  const orderRef = "KOR-" + Math.floor(100000 + Math.random() * 900000);

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();

    if (chosenOption === "Deposit25" && !transactionId.trim()) {
      alert("እባክዎን የቴሌብር ትራንዛክሽን ቁጥር ያስገቡ");
      return;
    }

    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      onConfirmOrder(chosenOption, transactionId.trim() || undefined);
    }, 1000);
  };

  return (
    <div className="modal-backdrop">
      <div className="telebirr-modal-sheet">
        <div className="telebirr-modal-header">
          <h3>💳 የክፍያ አማራጭዎን ይምረጡ</h3>
          <button type="button" className="btn-modal-close" onClick={onCancel}>✕</button>
        </div>

        {/* Options */}
        <div className="payment-options-selector">
          <label className={`option-card ${chosenOption === "Deposit25" ? "active" : ""}`}>
            <input
              type="radio"
              name="payOpt"
              value="Deposit25"
              checked={chosenOption === "Deposit25"}
              onChange={() => setChosenOption("Deposit25")}
            />
            <div className="option-text">
              <strong>አማራጭ 1፦ የ 25% የቴሌብር ቅድመ ክፍያ</strong>
              <p>25% ቅድመ ክፍያ በቴሌብር ይክፈሉ። ቀሪው 75% እቃው በ 7-14 ቀናት ውስጥ ደጃፍዎ ሲደርስ ይከፈላል።</p>
            </div>
          </label>

          <label className={`option-card ${chosenOption === "NoAdvancePayment" ? "active" : ""}`}>
            <input
              type="radio"
              name="payOpt"
              value="NoAdvancePayment"
              checked={chosenOption === "NoAdvancePayment"}
              onChange={() => setChosenOption("NoAdvancePayment")}
            />
            <div className="option-text">
              <strong className="green-highlight">✨ አማራጭ 2፦ ምንም ቅድመ ክፍያ የሌለው (100% ሲደርስ)</strong>
              <p>አሁን ምንም አይነት ቅድመ ክፍያ አይከፍሉም! ሙሉ ክፍያውን እቃው በአካል እስከ ደጃፍዎ ሲደርስ ብቻ ይከፍላሉ።</p>
            </div>
          </label>
        </div>

        <form onSubmit={handleConfirm}>
          {chosenOption === "Deposit25" && (
            <div className="telebirr-details-section">
              <div className="telebirr-receiver-card">
                <div className="receiver-item">
                  <span>የተቀባይ ቴሌብር ስልክ፦</span>
                  <strong>{receiverPhone}</strong>
                </div>
                <div className="receiver-item">
                  <span>የሂሳብ ባለቤት ስም፦</span>
                  <strong>{receiverName}</strong>
                </div>
                <div className="receiver-item">
                  <span>የትዕዛዝ መለያ (Ref)፦</span>
                  <strong className="ref-tag">{orderRef}</strong>
                </div>
              </div>

              <div className="deposit-highlight-card">
                <span>የሚከፈል የ 25% ቅድመ ክፍያ፦</span>
                <h2 className="deposit-amount-etb">{depositEtb.toLocaleString()} ብር</h2>
                <small>ቀሪ 75% ሲደርስ የሚከፈል፦ <strong>{codEtb.toLocaleString()} ብር</strong></small>
              </div>

              <div className="form-field-group">
                <label><strong>የቴሌብር ትራንዛክሽን ቁጥር (Transaction ID / SMS Code) *</strong></label>
                <input
                  type="text"
                  required
                  className="form-control-input"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  placeholder="ለምሳሌ፦ CI9482710"
                />
              </div>

              <button type="submit" className="btn-telebirr-confirm" disabled={submitting}>
                {submitting ? "ክፍያውን በማረጋገጥ ላይ..." : "✓ የ 25% ቅድመ ክፍያ አረጋግጥና እዘዝ"}
              </button>
            </div>
          )}

          {chosenOption === "NoAdvancePayment" && (
            <div className="no-advance-section">
              <div className="no-advance-card">
                <h4>🎉 ምንም ቅድመ ክፍያ አይጠበቅብዎትም!</h4>
                <p>እቃው አዲስ አበባ ደጃፍዎ ሲደርስ ብቻ ሙሉውን <strong>{totalEtb.toLocaleString()} ብር</strong> በጥሬ ገንዘብ ወይም በቴሌብር ይከፍላሉ።</p>
              </div>

              <button type="submit" className="btn-no-advance-confirm" disabled={submitting}>
                {submitting ? "ትዕዛዙን በመመዝገብ ላይ..." : "✓ ያለ ቅድመ ክፍያ ትዕዛዙን ላክ (100% ሲደርስ)"}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
