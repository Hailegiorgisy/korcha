// frontend/src/components/DispatcherDashboard.tsx
import React, { useState, useEffect } from "react";
import { Order } from "../types";

interface DispatcherDashboardProps {
  onBackToHome: () => void;
}

export const DispatcherDashboard: React.FC<DispatcherDashboardProps> = ({
  onBackToHome,
}) => {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("korcha_live_orders_v5");
      if (saved) {
        setOrders(JSON.parse(saved));
      }
    } catch {
      // fallback
    }
  }, []);

  const handleToggleStatus = (orderId: string, currentStatus: "Pending" | "Dispatched" | "Delivered") => {
    const nextStatus = currentStatus === "Pending" ? "Dispatched" : "Pending";
    const updated = orders.map((o) => (o.orderId === orderId ? { ...o, status: nextStatus } : o));
    setOrders(updated);
    localStorage.setItem("korcha_live_orders_v5", JSON.stringify(updated));
  };

  const handleOpenGoogleMaps = (lat: number, lng: number) => {
    const url = `https://www.google.com/maps?q=${lat},${lng}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="dispatcher-container">
      <div className="dispatch-header-row">
        <button type="button" className="btn-back-link" onClick={onBackToHome}>
          &larr; ወደ ዋና ገጽ ተመለስ
        </button>
        <h2>🚚 የአስተላላፊ እና የኩሪየር ገጽ (Dispatcher)</h2>
      </div>

      <p className="dispatch-count">የሚላኩ ንቁ ትዕዛዞች ({orders.length})</p>

      {orders.length === 0 ? (
        <div className="empty-orders-view">
          <p>ምንም ትዕዛዝ አልተመዘገበም። ደንበኞች እቃ ሲያዙ እዚህ ይዘረዘራል።</p>
        </div>
      ) : (
        <div className="orders-stack">
          {orders.map((o) => (
            <div key={o.orderId} className="dispatch-card">
              <div className="dispatch-card-top">
                <span className="order-code">#{o.orderId}</span>
                <span className={`status-badge ${o.status.toLowerCase()}`}>
                  {o.status === "Dispatched" ? "ተልኳል" : "በሂደት ላይ"}
                </span>
              </div>

              <div className="payment-mode-indicator">
                {o.paymentOption === "NoAdvancePayment" ? (
                  <span className="badge-no-advance">
                    ⭐ አማራጭ 2፦ ምንም ቅድመ ክፍያ የሌለው (100% ሲደርስ: {o.totalPrice.toLocaleString()} ብር)
                  </span>
                ) : (
                  <span className="badge-advance-paid">
                    🟢 አማራጭ 1፦ 25% ቴሌብር ተከፍሏል (Txn: {o.telebirrTransactionId || "N/A"}) | 75% ቀሪ: {o.codAmount.toLocaleString()} ብር
                  </span>
                )}
              </div>

              <div className="dispatch-items">
                <strong>የታዘዙ እቃዎች፦</strong>
                <ul>
                  {o.items.map((i) => (
                    <li key={i.id}>
                      {i.quantity}x {i.title} (መጠን፦ {i.selectedSize}፣ ቀለም፦ {i.selectedColor}) — {(i.priceEtb * i.quantity).toLocaleString()} ብር
                      <br />
                      <a href={i.sheinUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: "10px", color: "#0284c7" }}>
                        የሼይን ሊንክ ክፈት
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="dispatch-address">
                <p><strong>የመዳረሻ ምልክት፦</strong> {o.deliveryProfile.landmark}</p>
                <p><strong>ዋና ስልክ፦</strong> <a href={`tel:${o.deliveryProfile.primaryPhone}`}>{o.deliveryProfile.primaryPhone}</a></p>
                {o.deliveryProfile.backupPhone && (
                  <p><strong>ተጨማሪ ስልክ፦</strong> <a href={`tel:${o.deliveryProfile.backupPhone}`}>{o.deliveryProfile.backupPhone}</a></p>
                )}
                <p><strong>የማድረሻ ዘዴ፦</strong> {o.deliveryProfile.deliveryMethod}</p>
              </div>

              <div className="dispatch-actions-row">
                <button
                  type="button"
                  className="btn-map-nav"
                  onClick={() => handleOpenGoogleMaps(o.deliveryProfile.gps.lat, o.deliveryProfile.gps.lng)}
                >
                  📍 በጎግል ካርታ ክፈት
                </button>
                <button
                  type="button"
                  className="btn-status-toggle"
                  onClick={() => handleToggleStatus(o.orderId, o.status)}
                >
                  {o.status === "Pending" ? "✓ ተልኳል ብለህ መዝግብ" : "ወደ 'በሂደት ላይ' መልስ"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
