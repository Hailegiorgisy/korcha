// frontend/src/App.tsx
import React, { useState, useEffect } from "react";
import { DeliveryProfile, Order, QuotedProduct } from "./types";
import { Header } from "./components/Header";
import { SheinSearchHero } from "./components/SheinSearchHero";
import { CostEstimator } from "./components/CostEstimator";
import { HelpSupportModal } from "./components/HelpSupportModal";
import { CartDrawer } from "./components/CartDrawer";
import { LandmarkCheckout } from "./components/LandmarkCheckout";
import { PaymentModal } from "./components/PaymentModal";
import { DispatcherDashboard } from "./components/DispatcherDashboard";
import "./App.css";

export const App: React.FC = () => {
  const [view, setView] = useState<"home" | "checkout" | "dispatch">("home");
  const [cart, setCart] = useState<QuotedProduct[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [pendingDeliveryProfile, setPendingDeliveryProfile] = useState<DeliveryProfile | null>(null);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  useEffect(() => {
    try {
      const savedCart = localStorage.getItem("korcha_live_cart_v5");
      if (savedCart) setCart(JSON.parse(savedCart));
    } catch {
      // ignore
    }
  }, []);

  const saveCartState = (updated: QuotedProduct[]) => {
    setCart(updated);
    localStorage.setItem("korcha_live_cart_v5", JSON.stringify(updated));
  };

  const handleAddToCartAndCheckout = (product: QuotedProduct) => {
    const updated = [product, ...cart];
    saveCartState(updated);
    setView("checkout");
  };

  const handleRemoveItem = (id: string) => {
    const updated = cart.filter((i) => i.id !== id);
    saveCartState(updated);
  };

  const handleSubmitDelivery = (profile: DeliveryProfile) => {
    setPendingDeliveryProfile(profile);
    setIsPaymentOpen(true);
  };

  const handleConfirmOrder = async (
    paymentOption: "Deposit25" | "NoAdvancePayment",
    telebirrTxnId?: string
  ) => {
    if (!pendingDeliveryProfile) return;

    const totalEtb = cart.reduce((sum, item) => sum + item.priceEtb * item.quantity, 0);
    const depositAmount = paymentOption === "Deposit25" ? Math.round(totalEtb * 0.25) : 0;
    const codAmount = totalEtb - depositAmount;

    const newOrder: Order = {
      orderId: "KOR-" + Math.floor(100000 + Math.random() * 900000),
      userId: pendingDeliveryProfile.userId,
      items: [...cart],
      totalPrice: totalEtb,
      paymentOption,
      depositAmount,
      codAmount,
      depositPaid: paymentOption === "Deposit25",
      telebirrTransactionId: telebirrTxnId,
      status: "Pending",
      createdAt: new Date().toISOString(),
      deliveryProfile: pendingDeliveryProfile,
    };

    // Save locally
    try {
      const savedOrders = JSON.parse(localStorage.getItem("korcha_live_orders_v5") || "[]");
      savedOrders.unshift(newOrder);
      localStorage.setItem("korcha_live_orders_v5", JSON.stringify(savedOrders));
    } catch {
      // ignore
    }

    // Call backend API to dispatch worker notifications (Telegram & Email) via relative URL
    try {
      await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newOrder),
      });
    } catch (err) {
      console.warn("Backend order submission notification:", err);
    }

    setCompletedOrder(newOrder);
    saveCartState([]);
    setIsPaymentOpen(false);
    setView("home");
  };

  const handleScrollToEstimator = () => {
    const el = document.getElementById("cost-estimator-section");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const totalCartCount = cart.reduce((acc, i) => acc + i.quantity, 0);
  const totalCartPrice = cart.reduce((acc, i) => acc + i.priceEtb * i.quantity, 0);

  return (
    <div className="korcha-mobile-app">
      {/* Sticky Header */}
      <Header
        cartCount={totalCartCount}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenHelp={() => setIsHelpOpen(true)}
        currentView={view}
        onNavigate={(target) => {
          setView(target);
          setCompletedOrder(null);
        }}
      />

      <main className="korcha-body">
        {/* Success Banner */}
        {completedOrder && (\
          <div className="order-confirmed-banner">
            <h4>🎉 ትዕዛዝዎ በተሳካ ሁኔታ ተመዝግቧል! <strong>#{completedOrder.orderId}</strong></h4>
            {completedOrder.paymentOption === "NoAdvancePayment" ? (\
              <p>
                <strong>አማራጭ 2 ተመርጧል፦ ምንም ቅድመ ክፍያ የለም!</strong> እቃው አዲስ አበባ ደጃፍዎ ሲደርስ ሙሉውን <strong>{completedOrder.totalPrice.toLocaleString()} ብር</strong> ይከፍላሉ።
              </p>
            ) : (\
              <p>
                25% የቴሌብር ቅድመ ክፍያ ተመዝግቧል (Txn: <strong>{completedOrder.telebirrTransactionId}</strong>)። ቀሪው <strong>{completedOrder.codAmount.toLocaleString()} ብር</strong> እቃው ሲደርስ ይከፈላል።
              </p>
            )}
            <p className="notify-hint-tag">⚡ ለኮርቻ ሰራተኞች በቴሌግራም እና በኢሜይል ማሳወቂያ ተልኳል።</p>
            <button
              type="button"
              className="btn-link-action"
              onClick={() => setView("dispatch")}
            >
              የትዕዛዝዎን ሁኔታ በአስተላላፊ ገጽ ይመልከቱ &rarr;
            </button>
          </div>
        )}

        {/* 1. HOME VIEW: SEARCH HERO + COST ESTIMATOR */}
        {view === "home" && (\
          <>
            <SheinSearchHero onScrollToEstimator={handleScrollToEstimator} />
            <CostEstimator onAddToCartAndCheckout={handleAddToCartAndCheckout} />
          </>
        )}

        {/* 2. CHECKOUT VIEW */}
        {view === "checkout" && (\
          <LandmarkCheckout
            onBack={() => setView("home")}
            onSubmitDelivery={handleSubmitDelivery}
          />
        )}

        {/* 3. DISPATCHER VIEW */}
        {view === "dispatch" && (\
          <DispatcherDashboard onBackToHome={() => setView("home")} />
        )}
      </main>

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onRemoveItem={handleRemoveItem}
        onProceedToCheckout={() => {
          setIsCartOpen(false);
          setView("checkout");
        }}
      />

      {/* Payment Modal */}
      {isPaymentOpen && (\
        <PaymentModal
          totalEtb={totalCartPrice}
          depositEtb={Math.round(totalCartPrice * 0.25)}
          codEtb={totalCartPrice - Math.round(totalCartPrice * 0.25)}
          onCancel={() => setIsPaymentOpen(false)}
          onConfirmOrder={handleConfirmOrder}
        />
      )}

      {/* Help & Support Modal */}
      <HelpSupportModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />
    </div>
  );
};

export default App;
