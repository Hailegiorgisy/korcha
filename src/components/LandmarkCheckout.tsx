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
      (position) => {
        setGps({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setGpsLoading(false);
      },
      (err) => {
        console.warn("Geolocation warning:", err.message);
        // Fallback default coordinates around Addis Ababa Bole
        setGps({ lat: 8.9806, lng: 38.7578 });
        setGpsLoading(false);
      },
      { timeout: 8000 }
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!landmark.trim()) {
      alert(lang === "am" ? "እባክዎን በአቅራቢያ የሚገኝ ታዋቂ ምልክት ያስገቡ" : "Landmark description is required");
      return;
    }
    if (!primaryPhone.trim()) {
      alert(lang === "am" ? "ዋና ስልክ ቁጥር ያስገቡ" : "Primary phone number is required");
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
    <div className="checkout-container">
      <div className="checkout-header">
        <button type="button" className="btn-back" onClick={onBack}>
          &larr; {lang === "am" ? "ተመለስ" : "Back"}
        </button>
        <h3>{t("landmarkTitle", lang)}</h3>
      </div>

      <form onSubmit={handleSubmit} className="checkout-form">
        {/* GPS Pin Button */}
        <div className="form-group">
          <button
            type="button"
            className="btn-gps"
            onClick={handleDropGps}
            disabled={gpsLoading}
          >
            {gpsLoading ? "Acquiring GPS..." : t("dropGpsBtn", lang)}
          </button>
          {gps && (
            <p className="gps-indicator">
              ✅ {t("gpsAcquired", lang)} {gps.lat.toFixed(4)}, {gps.lng.toFixed(4)}
            </p>
          )}
        </div>

        {/* Landmark Text Field */}
        <div className="form-group">
          <label htmlFor="landmark">
            <strong>{lang === "am" ? "የቅርብ ታዋቂ ምልክት" : "Nearest Well-Known Landmark"} *</strong>
          </label>
          <textarea
            id="landmark"
            required
            rows={3}
            className="form-textarea"
            placeholder={t("landmarkPlaceholder", lang)}
            value={landmark}
            onChange={(e) => setLandmark(e.target.value)}
          />
        </div>

        {/* Two Active Phone Numbers */}
        <div className="form-group">
          <label htmlFor="primaryPhone">
            <strong>{t("primaryPhone", lang)} *</strong>
          </label>
          <input
            id="primaryPhone"
            type="tel"
            required
            className="form-input"
            placeholder="0911223344"
            value={primaryPhone}
            onChange={(e) => setPrimaryPhone(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="backupPhone">
            <strong>{t("backupPhone", lang)}</strong>
          </label>
          <input
            id="backupPhone"
            type="tel"
            className="form-input"
            placeholder="0922334455"
            value={backupPhone}
            onChange={(e) => setBackupPhone(e.target.value)}
          />
        </div>

        {/* Delivery Preference */}
        <div className="form-group">
          <label><strong>{t("deliveryMethod", lang)}</strong></label>
          <div className="radio-group">
            <label className="radio-label">
              <input
                type="radio"
                name="method"
                value="MotorCourier"
                checked={deliveryMethod === "MotorCourier"}
                onChange={() => setDeliveryMethod("MotorCourier")}
              />
              {t("courierDelivery", lang)}
            </label>
            <label className="radio-label">
              <input
                type="radio"
                name="method"
                value="HubPickup"
                checked={deliveryMethod === "HubPickup"}
                onChange={() => setDeliveryMethod("HubPickup")}
              />
              {t("hubPickup", lang)}
            </label>
          </div>
        </div>

        <button type="submit" className="btn-submit-checkout">
          {t("payBtn", lang)} &rarr;
        </button>
      </form>
    </div>
  );
};
