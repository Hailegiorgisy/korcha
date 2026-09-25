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

  const handleToggleStatus = (orderId: string, currentStatus: "Pending" | "Dispatched") => {
    const nextStatus = currentStatus === "Pending" ? "Dispatched" : "Pending";
    kvStore.updateOrderStatus(orderId, nextStatus);
    setOrders(kvStore.getOrders());
  };

  const handleOpenGoogleMaps = (lat: number, lng: number) => {
    const url = `https://www.google.com/maps?q=${lat},${lng}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="dispatch-container">
      <div className="dispatch-header">
        <button type="button" className="btn-back" onClick={onBackToShop}>
          &larr; {t("backToShop", lang)}
        </button>
        <h2>🚚 {t("dispatchTab", lang)}</h2>
      </div>

      <p className="dispatch-sub">{t("activeOrders", lang)} ({orders.length})</p>

      {orders.length === 0 ? (
        <div className="empty-orders">
          <p>No active orders placed yet. Complete a checkout in the shop to see it here.</p>
        </div>
      ) : (
        <div className="orders-grid">
          {orders.map((order) => (
            <div key={order.orderId} className="dispatch-order-card">
              <div className="order-top">
                <span className="order-id">#{order.orderId}</span>
                <span className={`status-pill ${order.status.toLowerCase()}`}>
                  {order.status === "Dispatched"
                    ? t("statusDispatched", lang)
                    : t("statusPending", lang)}
                </span>
              </div>

              {/* Items summary */}
              <div className="order-section">
                <strong>Items:</strong>
                <ul className="order-items-compact">
                  {order.items.map((i) => (
                    <li key={i.product.id}>
                      {i.quantity}x {i.product.name} ({(i.product.priceEtb * i.quantity).toLocaleString()} ETB)
                    </li>
                  ))}
                </ul>
              </div>

              {/* Price summary */}
              <div className="order-section price-split-compact">
                <span>Total: <strong>{order.totalPrice.toLocaleString()} ETB</strong></span>
                <span className="dep-paid">25% Dep Paid: {order.depositAmount.toLocaleString()} ETB</span>
                <span className="cod-due">75% COD Due: {order.codAmount.toLocaleString()} ETB</span>
              </div>

              {/* Delivery Details */}
              <div className="order-section delivery-details">
                <p>
                  <strong>Landmark:</strong> {order.deliveryProfile.landmark}
                </p>
                <p>
                  <strong>Primary Phone:</strong>{" "}
                  <a href={`tel:${order.deliveryProfile.primaryPhone}`}>
                    {order.deliveryProfile.primaryPhone}
                  </a>
                </p>
                {order.deliveryProfile.backupPhone && (
                  <p>
                    <strong>Backup Phone:</strong>{" "}
                    <a href={`tel:${order.deliveryProfile.backupPhone}`}>
                      {order.deliveryProfile.backupPhone}
                    </a>
                  </p>
                )}
                <p>
                  <strong>Method:</strong> {order.deliveryProfile.deliveryMethod}
                </p>
              </div>

              {/* Actions */}
              <div className="order-actions">
                <button
                  type="button"
                  className="btn-map"
                  onClick={() =>
                    handleOpenGoogleMaps(
                      order.deliveryProfile.gps.lat,
                      order.deliveryProfile.gps.lng
                    )
                  }
                >
                  📍 {t("openMaps", lang)}
                </button>

                <button
                  type="button"
                  className="btn-toggle-status"
                  onClick={() => handleToggleStatus(order.orderId, order.status)}
                >
                  {order.status === "Pending" ? `✓ ${t("markDispatched", lang)}` : "Revert to Pending"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
