// frontend/src/components/LandmarkCheckout.tsx
import React, { useState } from "react";
import { DeliveryProfile, Language } from "../types";
import { t } from "../utils/translations";

interface LandmarkCheckoutProps {
  lang: Language;
  onBack: () => void;
  onSubmitDelivery: (profile: DeliveryProfile) => void;
}

export const LandmarkCheckout: React.FC<LandmarkCheckoutProps> = ({
  lang,
  onBack,
  onSubmitDelivery,
}) => {
  const [gps, setGps] = useState<{ lat: number; lng: number } | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [landmark, setLandmark] = useState("");
  const [primaryPhone, setPrimaryPhone] = useState("");
  const [backupPhone, setBackupPhone] = useState("");
  const [deliveryMethod, setDeliveryMethod] = useState<"MotorCourier" | "HubPickup">("MotorCourier");

  const handleDropGps = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your device");
      return;
    }

    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGps({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setGpsLoading(false);
      },
      () => {
        setGps({ lat: 8.9806, lng: 38.7578 }); // Addis Bole center default
        setGpsLoading(false);
      },
      { timeout: 8000 }
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!landmark.trim()) {
      alert(lang === "am" ? "እባክዎን ታዋቂ ምልክት ያስገቡ" : "Landmark description is required");
      return;
    }
    if (!primaryPhone.trim()) {
      alert(lang === "am" ? "ዋና ስልክ ቁጥር ያስገቡ" : "Primary phone is required");
      return;
    }

    onSubmitDelivery({
      userId: "user-" + Math.floor(1000 + Math.random() * 9000),
      gps: gps || { lat: 9.0107, lng: 38.7612 },
      landmark: landmark.trim(),
      primaryPhone: primaryPhone.trim(),
      backupPhone: backupPhone.trim(),
      deliveryMethod,
    });
  };

  return (
    <div className="landmark-checkout-box">
      <div className="checkout-top-nav">
        <button type="button" className="btn-back-link" onClick={onBack}>
          &larr; {lang === "am" ? "ተመለስ" : "Back"}
        </button>
        <h3>{t("landmarkTitle", lang)}</h3>
      </div>

      <form onSubmit={handleSubmit} className="checkout-fields-form">
        <div className="field-group">
          <button
            type="button"
            className="btn-gps-action"
            onClick={handleDropGps}
            disabled={gpsLoading}
          >
            {gpsLoading ? "Acquiring Pin..." : t("dropGpsBtn", lang)}
          </button>
          {gps && (
            <p className="gps-recorded-tag">
              ✅ {t("gpsAcquired", lang)} {gps.lat.toFixed(4)}, {gps.lng.toFixed(4)}
            </p>
          )}
        </div>

        <div className="field-group">
          <label><strong>{lang === "am" ? "የቅርብ ታዋቂ ምልክት *" : "Nearest Well-Known Landmark *"}</strong></label>
          <textarea
            required
            rows={3}
            className="text-input"
            placeholder={t("landmarkPlaceholder", lang)}
            value={landmark}
            onChange={(e) => setLandmark(e.target.value)}
          />
        </div>

        <div className="field-group">
          <label><strong>{t("primaryPhone", lang)}</strong></label>
          <input
            type="tel"
            required
            className="text-input"
            placeholder="0911223344"
            value={primaryPhone}
            onChange={(e) => setPrimaryPhone(e.target.value)}
          />
        </div>

        <div className="field-group">
          <label><strong>{t("backupPhone", lang)}</strong></label>
          <input
            type="tel"
            className="text-input"
            placeholder="0922334455"
            value={backupPhone}
            onChange={(e) => setBackupPhone(e.target.value)}
          />
        </div>

        <div className="field-group">
          <label><strong>{t("deliveryMethod", lang)}</strong></label>
          <div className="radio-options-row">
            <label className="radio-card">
              <input
                type="radio"
                name="dm"
                value="MotorCourier"
                checked={deliveryMethod === "MotorCourier"}
                onChange={() => setDeliveryMethod("MotorCourier")}
              />
              {t("courierDelivery", lang)}
            </label>
            <label className="radio-card">
              <input
                type="radio"
                name="dm"
                value="HubPickup"
                checked={deliveryMethod === "HubPickup"}
                onChange={() => setDeliveryMethod("HubPickup")}
              />
              {t("hubPickup", lang)}
            </label>
          </div>
        </div>

        <button type="submit" className="btn-proceed-payment">
          {t("proceedToPayment", lang)} &rarr;
        </button>
      </form>
    </div>
  );
};
