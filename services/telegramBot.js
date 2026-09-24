import { Telegraf, Markup } from 'telegraf';
import { parseProductUrl } from './scraper.js';
import { calculateLandedCost } from './calculator.js';
import db from '../config/db.js';
import 'dotenv/config';

export const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

// 1. /start command
bot.start((ctx) => {
  const welcomeText = 
`👋 *Welcome to Korcha (ኮርቻ)!*

Shop any fashion, electronics, or cosmetics merchandise from China (Shein, AliExpress) and pay locally with *Telebirr* or *CBE Birr*.

📌 *How to use:*
1️⃣ Copy any product link from Shein.
2️⃣ Paste and send the link here.
3️⃣ Get an instant all-inclusive landed price in ETB (Air Cargo + Customs included).

You can also browse our trending catalog below:`;

  return ctx.replyWithMarkdown(
    welcomeText,
    Markup.inlineKeyboard([
      [Markup.button.webApp('🛍️ Open Korcha Store', 'https://korcha.com.et')],
      [
        Markup.button.callback('📦 Track My Order', 'ACTION_TRACK'),
        Markup.button.url('💬 Talk to Agent', 'https://t.me/korcha_support')
      ]
    ])
  );
});

// 2. /help command
bot.help((ctx) => {
  ctx.reply(
    `ℹ️ *Korcha Commands:*\n\n` +
    `• Send any Shein link to get a price quote.\n` +
    `• /track <OrderNumber> - Check shipment status.\n` +
    `• /support - Connect with a customer representative.\n` +
    `• /shop - Launch the web storefront.`,
    { parse_mode: 'Markdown' }
  );
});

// 3. /track command (e.g. /track KC-123456)
bot.command('track', async (ctx) => {
  const parts = ctx.message.text.split(' ');
  const orderNumber = parts?.trim();

  if (!orderNumber) {
    return ctx.reply('Please provide your order number. Example:\n`/track KC-123456`', { parse_mode: 'Markdown' });
  }

  try {
    const [orders] = await db.query(
      `SELECT order_number, product_title, total_etb, status, tracking_number, pickup_location 
       FROM orders WHERE order_number = ?`,
      [orderNumber]
    );

    if (orders.length === 0) {
      return ctx.reply(`❌ Order *${orderNumber}* was not found. Please verify the code.`, { parse_mode: 'Markdown' });
    }

    const o = orders[0];
    const statusFormatted = o.status.replace(/_/g, ' ').toUpperCase();

    const response = 
`📦 *Order Status: #${o.order_number}*

🛍️ *Item:* ${o.product_title}
💰 *Total:* ${o.total_etb} ETB
📍 *Pickup:* ${o.pickup_location || 'Bole Medhanialem Hub'}
🚚 *Current Stage:* *${statusFormatted}*
${o.tracking_number ? `🔖 *Cargo AWB:* \`${o.tracking_number}\`` : ''}`;

    ctx.replyWithMarkdown(response);
  } catch (err) {
    ctx.reply('Error retrieving tracking details. Please try again.');
  }
});

// 4. Callback action for track button
bot.action('ACTION_TRACK', (ctx) => {
  ctx.reply('To track your package, send:\n`/track <OrderNumber>`\n\nExample: `/track KC-123456`', { parse_mode: 'Markdown' });
});

// 5. Automatic Shein link handler
bot.on('text', async (ctx) => {
  const text = ctx.message.text.trim();

  // If user pasted a Shein URL
  if (text.includes('shein.') || text.includes('shein.top')) {
    const loadingMsg = await ctx.reply('⏳ Fetching product details and calculating ETB rate...');

    try {
      const product = await parseProductUrl(text);

      if (!product.success) {
        return ctx.reply(`❌ ${product.error || 'Could not read this link.'}`);
      }

      const cost = await calculateLandedCost({ usdPrice: product.usdPrice });

      const caption = 
`🛍️ *${product.title}*

💵 *Original Shein Price:* $${product.usdPrice}
📦 *Air Cargo (China → Bole):* ${cost.breakdown.freightETB} ETB
📑 *Customs & Clearance Duty:* ${cost.breakdown.customsETB} ETB
💼 *Service & Handling Fee:* ${cost.breakdown.serviceFeeETB} ETB
-----------------------------------
🇪🇹 *TOTAL LANDED COST:* *${cost.totalETB} ETB*

_Includes international freight to Addis Ababa & customs clearance._`;

      // Reply with product photo and direct checkout button
      await ctx.replyWithPhoto(product.imageUrl, {
        caption,
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard([
          [Markup.button.webApp('💳 Complete Order & Pay', `https://korcha.com.et/?prefill=${encodeURIComponent(text)}`)],
          [Markup.button.url('💬 Ask Agent About This Item', 'https://t.me/korcha_support')]
        ])
      });

      // Delete the loading message
      ctx.telegram.deleteMessage(ctx.chat.id, loadingMsg.message_id).catch(() => {});
    } catch (error) {
      ctx.reply('❌ An error occurred while calculating the price. Please check the link.');
    }
  }
});