// frontend/src/App.tsx
import React, { useState, useEffect } from "react";
import { CartItem, DeliveryProfile, Language, Order, Product } from "./types";
import { kvStore } from "./utils/kvStore";
import { Header } from "./components/Header";
import { ProductCatalog } from "./components/ProductCatalog";
import { ProductDetailModal } from "./components/ProductDetailModal";
import { QuoteRequestView } from "./components/QuoteRequestView";
import { CartDrawer } from "./components/CartDrawer";
import { LandmarkCheckout } from "./components/LandmarkCheckout";
import { PaymentModal } from "./components/PaymentModal";
import { DispatcherDashboard } from "./components/DispatcherDashboard";
import { t } from "./utils/translations";
import "./App.css";

export const App: React.FC = () => {
  const [lang, setLang] = useState<Language>("am"); // Default to Amharic for local Ethiopian context
  const [view, setView] = useState<"catalog" | "quote" | "checkout" | "dispatch">("catalog");
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [selectedDetailProduct, setSelectedDetailProduct] = useState<Product | null>(null);
  const [pendingDeliveryProfile, setPendingDeliveryProfile] = useState<DeliveryProfile | null>(null);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  useEffect(() => {
    setProducts(kvStore.getProducts());
  }, []);

  const handleToggleLang = () => {
    setLang((prev) => (prev === "en" ? "am" : "en"));
  };

  const handleAddToCart = (product: Product, size?: string, color?: string, notes?: string) => {
    setCart((prev) => {
      const existing = prev.find(
        (item) =>
          item.product.id === product.id &&
          item.selectedSize === size &&
          item.selectedColor === color
      );
      if (existing) {
        return prev.map((item) =>
          item === existing ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [
        ...prev,
        {
          product,
          quantity: 1,
          selectedSize: size,
          selectedColor: color,
          customNotes: notes,
        },
      ];
    });
    setIsCartOpen(true);
  };

  const handleUpdateQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const nextQty = item.quantity + delta;
            return nextQty > 0 ? { ...item, quantity: nextQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const handleRemoveItem = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const handleProceedToCheckout = () => {
    setIsCartOpen(false);
    setView("checkout");
  };

  const handleSubmitDelivery = (profile: DeliveryProfile) => {
    setPendingDeliveryProfile(profile);
    setIsPaymentOpen(true);
  };

  const handleConfirmTelebirrPayment = (txnId: string) => {
    if (!pendingDeliveryProfile) return;

    const totalEtb = cart.reduce((sum, item) => sum + item.product.priceEtb * item.quantity, 0);
    const depositAmount = Math.round(totalEtb * 0.25);
    const codAmount = totalEtb - depositAmount;

    const newOrder: Order = {
      orderId: "KOR-" + Math.floor(100000 + Math.random() * 900000),
      userId: pendingDeliveryProfile.userId,
      items: [...cart],
      totalPrice: totalEtb,
      depositAmount,
      codAmount,
      depositPaid: true,
      telebirrTransactionId: txnId,
      status: "Pending",
      createdAt: new Date().toISOString(),
      deliveryProfile: pendingDeliveryProfile,
    };

    kvStore.saveOrder(newOrder);
    setCompletedOrder(newOrder);
    setCart([]);
    setIsPaymentOpen(false);
    setView("catalog");
  };

  const totalCartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const totalCartPrice = cart.reduce((sum, item) => sum + item.product.priceEtb * item.quantity, 0);

  return (
    <div className="korcha-mobile-app">
      {/* Top Header with branding, language switch, cart count, navigation */}
      <Header
        lang={lang}
        onToggleLang={handleToggleLang}
        cartCount={totalCartCount}
        onOpenCart={() => setIsCartOpen(true)}
        currentView={view}
        onNavigate={(target) => {
          setView(target);
          setCompletedOrder(null);
        }}
      />

      <main className="korcha-body">
        {/* Success Banner */}
        {completedOrder && (
          <div className="order-confirmed-banner">
            <h4>🎉 {t("orderSuccess", lang)} <strong>#{completedOrder.orderId}</strong></h4>
            <p>
              25% Telebirr Deposit Paid (Txn: <strong>{completedOrder.telebirrTransactionId}</strong>).
              Remaining <strong>{completedOrder.codAmount.toLocaleString()} ETB</strong> due upon landmark delivery.
            </p>
            <button
              type="button"
              className="btn-link-action"
              onClick={() => setView("dispatch")}
            >
              Track in Dispatcher Dashboard &rarr;
            </button>
          </div>
        )}

        {/* 1. CATALOG VIEW (500+ items) */}
        {view === "catalog" && (
          <ProductCatalog
            products={products}
            lang={lang}
            onOpenProductDetail={(prod) => setSelectedDetailProduct(prod)}
            onAddToCartDirect={(prod) => handleAddToCart(prod)}
          />
        )}

        {/* 2. QUOTE REQUEST VIEW (Journey A) */}
        {view === "quote" && (
          <QuoteRequestView
            lang={lang}
            onAddCustomProductToCart={(customProd, size, color, notes) => {
              handleAddToCart(customProd, size, color, notes);
            }}
          />
        )}

        {/* 3. LANDMARK CHECKOUT */}
        {view === "checkout" && (
          <LandmarkCheckout
            lang={lang}
            onBack={() => setView("catalog")}
            onSubmitDelivery={handleSubmitDelivery}
          />
        )}

        {/* 4. DISPATCHER VIEW */}
        {view === "dispatch" && (
          <DispatcherDashboard
            lang={lang}
            onBackToShop={() => setView("catalog")}
          />
        )}
      </main>

      {/* Product Detail Modal (Opens when tapping any of the 500+ items) */}
      <ProductDetailModal
        product={selectedDetailProduct}
        lang={lang}
        onClose={() => setSelectedDetailProduct(null)}
        onAddToCart={(prod, size, color, notes) => {
          handleAddToCart(prod, size, color, notes);
        }}
      />

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        lang={lang}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onProceedToCheckout={handleProceedToCheckout}
      />

      {/* Telebirr Payment Modal */}
      {isPaymentOpen && (
        <PaymentModal
          totalEtb={totalCartPrice}
          depositEtb={Math.round(totalCartPrice * 0.25)}
          codEtb={totalCartPrice - Math.round(totalCartPrice * 0.25)}
          lang={lang}
          onCancel={() => setIsPaymentOpen(false)}
          onConfirmPayment={handleConfirmTelebirrPayment}
        />
      )}
    </div>
  );
};

export default App;
