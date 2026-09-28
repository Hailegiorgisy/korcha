// frontend/src/components/LandmarkCheckout.tsx
import React, { useState } from "react";
import { DeliveryProfile } from "../types";

interface LandmarkCheckoutProps {
  onBack: () => void;
  onSubmitDelivery: (profile: DeliveryProfile) => void;
}

export const LandmarkCheckout: React.FC<LandmarkCheckoutProps> = ({
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
      alert("Geolocation በዚህ ስልክ ላይ አልተገኘም");
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
      alert("እባክዎን በአቅራቢያ የሚገኝ ታዋቂ ምልክት ያስገቡ");
      return;
    }
    if (!primaryPhone.trim()) {
      alert("እባክዎን ዋና ስልክ ቁጥር ያስገቡ");
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
          &larr; ተመለስ
        </button>
        <h3>📍 የመዳረሻ አድራሻ እና ታዋቂ ምልክት</h3>
      </div>

      <form onSubmit={handleSubmit} className="checkout-fields-form">
        <div className="field-group">
          <button
            type="button"
            className="btn-gps-action"
            onClick={handleDropGps}
            disabled={gpsLoading}
          >
            {gpsLoading ? "መገኛ ቦታን በመፈለግ ላይ..." : "📍 የጂፒኤስ መገኛ ቦታዬን ምልክት አድርግ"}
          </button>
          {gps && (
            <p className="gps-recorded-tag">
              ✅ የጂፒኤስ መገኛ ተመዝግቧል፦ {gps.lat.toFixed(4)}, {gps.lng.toFixed(4)}
            </p>
          )}
        </div>

        <div className="field-group">
          <label><strong>የቅርብ ታዋቂ ምልክት (Landmark) *</strong></label>
          <textarea
            required
            rows={3}
            className="form-control-input"
            placeholder="ለምሳሌ፦ ቦሌ ከኤድና ሞል ጀርባ፣ ከቶታል ማደያ ጎን፣ አቢሲኒያ ባንክ አጠገብ..."
            value={landmark}
            onChange={(e) => setLandmark(e.target.value)}
          />
        </div>

        <div className="field-group">
          <label><strong>ዋና ስልክ ቁጥር *</strong></label>
          <input
            type="tel"
            required
            className="form-control-input"
            placeholder="0911223344"
            value={primaryPhone}
            onChange={(e) => setPrimaryPhone(e.target.value)}
          />
        </div>

        <div className="field-group">
          <label><strong>ተጨማሪ ስልክ ቁጥር (አማራጭ)</strong></label>
          <input
            type="tel"
            className="form-control-input"
            placeholder="0922334455"
            value={backupPhone}
            onChange={(e) => setBackupPhone(e.target.value)}
          />
        </div>

        <div className="field-group">
          <label><strong>የማድረሻ ምርጫ</strong></label>
          <div className="radio-options-row">
            <label className="radio-card">
              <input
                type="radio"
                name="dm"
                value="MotorCourier"
                checked={deliveryMethod === "MotorCourier"}
                onChange={() => setDeliveryMethod("MotorCourier")}
              />
              በሞተር ኩሪየር (እስከ ደጃፍ)
            </label>
            <label className="radio-card">
              <input
                type="radio"
                name="dm"
                value="HubPickup"
                checked={deliveryMethod === "HubPickup"}
                onChange={() => setDeliveryMethod("HubPickup")}
              />
              ከማዕከል መውሰጃ (ቦሌ)
            </label>
          </div>
        </div>

        <button type="submit" className="btn-proceed-payment">
          ወደ ክፍያ አማራጭ ይቀጥሉ &rarr;
        </button>
      </form>
    </div>
  );
};
