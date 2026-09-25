// frontend/src/App.tsx
import React, { useState, useEffect } from "react";
import { CartItem, DeliveryProfile, Language, Order, Product } from "./types";
import { kvStore } from "./utils/kvStore";
import { Header } from "./components/Header";
import { SheinUrlQuoteBar } from "./components/SheinUrlQuoteBar";
import { ProductCatalog } from "./components/ProductCatalog";
import { CartDrawer } from "./components/CartDrawer";
import { LandmarkCheckout } from "./components/LandmarkCheckout";
import { PaymentModal } from "./components/PaymentModal";
import { DispatcherDashboard } from "./components/DispatcherDashboard";
import { t } from "./utils/translations";
import "./App.css";

export const App: React.FC = () => {
  const [lang, setLang] = useState<Language>("en");
  const [view, setView] = useState<"shop" | "checkout" | "dispatch">("shop");
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [deliveryProfile, setDeliveryProfile] = useState<DeliveryProfile | null>(null);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  // Initialize products from managed Key-Value Store
  useEffect(() => {
    setProducts(kvStore.getProducts());
  }, []);

  const handleToggleLang = () => {
    setLang((prev) => (prev === "en" ? "am" : "en"));
  };

  const handleAddToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const handleAddParsedProduct = (product: Product) => {
    kvStore.addProduct(product);
    setProducts(kvStore.getProducts());
    handleAddToCart(product);
  };

  const handleUpdateQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
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
    setDeliveryProfile(profile);
    setIsPaymentOpen(true);
  };

  const handleConfirmPayment = () => {
    if (!deliveryProfile) return;

    const totalEtb = cart.reduce(
      (sum, item) => sum + item.product.priceEtb * item.quantity,
      0
    );
    const depositAmount = Math.round(totalEtb * 0.25);
    const codAmount = totalEtb - depositAmount;

    const newOrder: Order = {
      orderId: "ET-" + Math.floor(100000 + Math.random() * 900000),
      userId: deliveryProfile.userId,
      items: [...cart],
      totalPrice: totalEtb,
      depositAmount,
      codAmount,
      depositPaid: true,
      status: "Pending",
      createdAt: new Date().toISOString(),
      deliveryProfile,
    };

    kvStore.saveOrder(newOrder);
    setCompletedOrder(newOrder);
    setCart([]);
    setIsPaymentOpen(false);
  };

  const totalCartCount = cart.reduce((count, item) => count + item.quantity, 0);
  const totalCartPrice = cart.reduce(
    (sum, item) => sum + item.product.priceEtb * item.quantity,
    0
  );

  return (
    <div className="mobile-shell">
      {/* Top sticky header */}
      <Header
        lang={lang}
        onToggleLang={handleToggleLang}
        cartCount={totalCartCount}
        onOpenCart={() => setIsCartOpen(true)}
        currentView={view === "dispatch" ? "dispatch" : "shop"}
        onNavigate={(target) => {
          setView(target);
          setCompletedOrder(null);
        }}
      />

      <main className="content-container">
        {/* DISPATCH VIEW */}
        {view === "dispatch" && (
          <DispatcherDashboard
            lang={lang}
            onBackToShop={() => setView("shop")}
          />
        )}

        {/* CHECKOUT FLOW */}
        {view === "checkout" && (
          <LandmarkCheckout
            lang={lang}
            onBack={() => setView("shop")}
            onSubmitDelivery={handleSubmitDelivery}
          />
        )}

        {/* SHOP FRONT */}
        {view === "shop" && (
          <>
            {/* Order Confirmation Banner */}
            {completedOrder && (
              <div className="order-success-banner">
                <h4>🎉 {t("orderSuccess", lang)} <strong>#{completedOrder.orderId}</strong></h4>
                <p>
                  25% Deposit Paid via Chapa. The remaining{" "}
                  <strong>{completedOrder.codAmount.toLocaleString()} ETB</strong> will be collected via COD upon landmark delivery.
                </p>
                <button
                  type="button"
                  className="btn-link"
                  onClick={() => setView("dispatch")}
                >
                  View in Dispatcher Dashboard &rarr;
                </button>
              </div>
            )}

            {/* Feature 2: On-Demand Shein URL Quote Bar */}
            <SheinUrlQuoteBar
              lang={lang}
              onAddParsedProduct={handleAddParsedProduct}
            />

            {/* Feature 1: Curated Featured Catalog */}
            <ProductCatalog
              products={products}
              lang={lang}
              onAddToCart={handleAddToCart}
            />
          </>
        )}
      </main>

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

      {/* Mock Chapa Split Payment Modal */}
      {isPaymentOpen && (
        <PaymentModal
          totalEtb={totalCartPrice}
          depositEtb={Math.round(totalCartPrice * 0.25)}
          codEtb={totalCartPrice - Math.round(totalCartPrice * 0.25)}
          lang={lang}
          onCancel={() => setIsPaymentOpen(false)}
          onConfirmPayment={handleConfirmPayment}
        />
      )}
    </div>
  );
};

export default App;
