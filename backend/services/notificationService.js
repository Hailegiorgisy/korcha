// backend/services/notificationService.js
import {
  TELEGRAM_BOT_TOKEN,
  TELEGRAM_WORKER_CHAT_ID,
  WORKER_EMAIL,
} from "../config/notificationConfig.js";

/**
 * Dispatches an instant Telegram notification to the Korcha workers group / channel.
 */
async function sendTelegramMessage(text) {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_WORKER_CHAT_ID) {
    console.log("[TELEGRAM NOTIFICATION (Simulated - Token/ChatId not set)]:\n" + text);
    return { simulated: true };
  }

  try {
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: TELEGRAM_WORKER_CHAT_ID,
        text,
        parse_mode: "HTML",
      }),
    });
    const result = await response.json();
    return result;
  } catch (err) {
    console.error("[TELEGRAM DISPATCH ERROR]:", err.message);
    return { error: err.message };
  }
}

export const notificationService = {
  /**
   * 1. Alert workers when a customer agrees to terms & places an order
   */
  async notifyNewOrder(order) {
    const itemsList = (order.items || [order.item])
      .map(
        (i) =>
          `• <b>${i.quantity || 1}x ${i.product?.name || i.product?.title || "Marketplace Product"}</b>\n` +
          `  መድረክ (Store): ${(i.product?.marketplace || "China").toUpperCase()}\n` +
          `  Size: ${i.selectedSize || "N/A"} | Color: ${i.selectedColor || "N/A"}\n` +
          `  ሊንክ: ${i.product?.url || i.product?.sheinUrl || "N/A"}`
      )
      .join("\n");

    const message =
      `🚨 <b>አዲስ የኮርቻ ትዕዛዝ ደርሷል! (NEW ORDER)</b>\n\n` +
      `<b>የትዕዛዝ ቁጥር (Order ID):</b> #${order.orderNumber || order.orderId}\n` +
      `<b>ደንበኛ ስም:</b> ${order.customerName || "የኮርቻ ደንበኛ"}\n` +
      `<b>ደንበኛ ስልክ:</b> ${order.customerPhone || order.deliveryProfile?.primaryPhone}\n` +
      `<b>የመዳረሻ ከተማ/ክፍለ ከተማ:</b> ${order.deliveryCity || "አዲስ አበባ"}፣ ${order.deliverySubcity || ""}\n` +
      `<b>የመኖሪያ ምልክት (Landmark):</b> ${order.deliveryLandmark || order.deliveryProfile?.landmark}\n\n` +
      `<b>የታዘዙ እቃዎች (Items):</b>\n${itemsList}\n\n` +
      `💰 <b>ጠቅላላ የበር ላይ ዋጋ:</b> ${(order.totalPrice || order.item?.pricing?.totalPriceEtb || 0).toLocaleString()} ብር\n` +
      `💵 <b>የ 25% ቅድመ ክፍያ (የተጠጋጋ):</b> ${(order.depositAmount || order.item?.pricing?.depositAmountEtb || 0).toLocaleString()} ብር\n` +
      `📦 <b>ቀሪ 75% ሲደርስ የሚከፈል:</b> ${(order.codAmount || order.item?.pricing?.codAmountEtb || 0).toLocaleString()} ብር\n` +
      `💳 <b>የክፍያ ዘዴ:</b> ${order.depositMethod || "ቴሌብር"} (Txn: <code>${order.telebirrTxnId || "Pending"}</code>)\n` +
      `✅ <b>ደንበኛው ደንቦቹን ተስማምቷል</b>\n` +
      `⏰ <b>ቀን:</b> ${new Date().toLocaleString()}`;

    await sendTelegramMessage(message);
  },

  /**
   * 2. Alert workers when a customer submits digital payment
   */
  async notifyPaymentReceived(order, txnId) {
    const message =
      `💰 <b>የ 25% ዲጂታል ቅድመ ክፍያ ተፈጽሟል! (DEPOSIT PAID)</b>\n\n` +
      `<b>የትዕዛዝ ቁጥር:</b> #${order.orderNumber || order.orderId}\n` +
      `<b>የግብይት ቁጥር (Txn Ref):</b> <code>${txnId}</code>\n` +
      `<b>የተከፈለ መጠን (25%):</b> ${(order.depositAmount || order.item?.pricing?.depositAmountEtb || 0).toLocaleString()} ብር\n` +
      `<b>ቀሪ የሚከፈል (COD 75%):</b> ${(order.codAmount || order.item?.pricing?.codAmountEtb || 0).toLocaleString()} ብር\n` +
      `<b>የደንበኛ ስልክ:</b> ${order.customerPhone || order.deliveryProfile?.primaryPhone}\n` +
      `<b>አድራሻ/ምልክት:</b> ${order.deliveryLandmark || order.deliveryProfile?.landmark}\n` +
      `<b>ሰዓት:</b> ${new Date().toLocaleString()}`;

    await sendTelegramMessage(message);
  },
};
