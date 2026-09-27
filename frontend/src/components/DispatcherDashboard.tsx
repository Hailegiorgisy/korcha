// frontend/src/components/DispatcherDashboard.tsx
import React, { useState, useEffect } from "react";
import { Order, Language } from "../types";
import { kvStore } from "../utils/kvStore";
import { t } from "../utils/translations";

interface DispatcherDashboardProps {
  lang: Language;
  onBackToShop: () => void;
}

export const DispatcherDashboard: React.FC<DispatcherDashboardProps> = ({
  lang,
  onBackToShop,
}) => {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    setOrders(kvStore.getOrders());
  }, []);

  const handleToggleStatus = (orderId: string, currentStatus: "Pending" | "Dispatched" | "Delivered") => {
    const nextStatus = currentStatus === "Pending" ? "Dispatched" : "Pending";
    kvStore.updateOrderStatus(orderId, nextStatus);
    setOrders(kvStore.getOrders());
  };

  const handleOpenGoogleMaps = (lat: number, lng: number) => {
    const url = `https://www.google.com/maps?q=${lat},${lng}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="dispatcher-container">
      <div className="dispatch-header-row">
        <button type="button" className="btn-back-link" onClick={onBackToShop}>
          &larr; {t("backToShop", lang)}
        </button>
        <h2>🚚 {t("dispatchTab", lang)}</h2>
      </div>

      <p className="dispatch-count">{t("activeOrders", lang)} ({orders.length})</p>

      {orders.length === 0 ? (
        <div className="empty-orders-view">
          <p>No active orders placed yet. Add items to bag and checkout to test dispatch.</p>
        </div>
      ) : (
        <div className="orders-stack">
          {orders.map((o) => (
            <div key={o.orderId} className="dispatch-card">
              <div className="dispatch-card-top">
                <span className="order-code">#{o.orderId}</span>
                <span className={`status-badge ${o.status.toLowerCase()}`}>
                  {o.status === "Dispatched" ? t("statusDispatched", lang) : t("statusPending", lang)}
                </span>
              </div>

              {o.telebirrTransactionId && (
                <p className="txn-ref-line">
                  🟢 Telebirr Txn: <strong>{o.telebirrTransactionId}</strong> (25% Paid)
                </p>
              )}

              <div className="dispatch-items">
                <strong>Items:</strong>
                <ul>
                  {o.items.map((i) => (
                    <li key={i.product.id}>
                      {i.quantity}x {lang === "am" && i.product.nameAm ? i.product.nameAm : i.product.name}
                      {i.selectedSize && ` (Size: ${i.selectedSize})`}
                      {` - ${(i.product.priceEtb * i.quantity).toLocaleString()} ETB`}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="dispatch-price-box">
                <div>Total: <strong>{o.totalPrice.toLocaleString()} ETB</strong></div>
                <div className="due-cod">75% COD Due: <strong>{o.codAmount.toLocaleString()} ETB</strong></div>
              </div>

              <div className="dispatch-address">
                <p><strong>Landmark:</strong> {o.deliveryProfile.landmark}</p>
                <p><strong>Primary:</strong> <a href={`tel:${o.deliveryProfile.primaryPhone}`}>{o.deliveryProfile.primaryPhone}</a></p>
                {o.deliveryProfile.backupPhone && (
                  <p><strong>Backup:</strong> <a href={`tel:${o.deliveryProfile.backupPhone}`}>{o.deliveryProfile.backupPhone}</a></p>
                )}
                <p><strong>Method:</strong> {o.deliveryProfile.deliveryMethod}</p>
              </div>

              <div className="dispatch-actions-row">
                <button
                  type="button"
                  className="btn-map-nav"
                  onClick={() => handleOpenGoogleMaps(o.deliveryProfile.gps.lat, o.deliveryProfile.gps.lng)}
                >
                  📍 {t("openMaps", lang)}
                </button>
                <button
                  type="button"
                  className="btn-status-toggle"
                  onClick={() => handleToggleStatus(o.orderId, o.status)}
                >
                  {o.status === "Pending" ? `✓ ${t("markDispatched", lang)}` : "Revert"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
