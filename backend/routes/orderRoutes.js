// backend/routes/orderRoutes.js
import express from "express";

const router = express.Router();
const orders = [];

router.post("/", (req, res) => {
  try {
    const {
      userId = "tg-user-" + Math.floor(Math.random() * 10000),
      items,
      totalPrice,
      depositAmount,
      codAmount,
      deliveryProfile,
    } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Order must contain at least one item" });
    }

    if (!deliveryProfile || !deliveryProfile.landmark || !deliveryProfile.primaryPhone) {
      return res.status(400).json({
        error: "Delivery profile requires nearest landmark and primary phone number",
      });
    }

    const newOrder = {
      orderId: "ORD-" + Math.floor(100000 + Math.random() * 900000),
      userId,
      items,
      totalPrice: Math.round(totalPrice),
      depositAmount: Math.round(depositAmount),
      codAmount: Math.round(codAmount),
      depositPaid: true,
      status: "Pending",
      createdAt: new Date().toISOString(),
      deliveryProfile: {
        userId,
        gps: deliveryProfile.gps || { lat: 9.0107, lng: 38.7612 },
        landmark: deliveryProfile.landmark.trim(),
        primaryPhone: deliveryProfile.primaryPhone.trim(),
        backupPhone: (deliveryProfile.backupPhone || "").trim(),
        deliveryMethod: deliveryProfile.deliveryMethod || "MotorCourier",
      },
    };

    orders.unshift(newOrder);
    res.status(201).json(newOrder);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/", (req, res) => {
  res.status(200).json(orders);
});

router.patch("/:orderId/status", (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body;

  const order = orders.find((o) => o.orderId === orderId);
  if (!order) {
    return res.status(404).json({ error: "Order not found" });
  }

  if (status) {
    order.status = status;
  }
  res.status(200).json(order);
});

export default router;
