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
_Your Direct Bridge from Shein China to Ethiopia._

✈️ *Guaranteed Delivery:* 7–14 Days via Air Cargo to Addis Ababa.

🛍️ *Two Shopping Options:*
1️⃣ *Direct Shein Pass (25 ETB):* Connect directly to browse Shein with personal concierge assistance.
2️⃣ *Order with 25% Deposit:* Choose any item, pay only 25% upfront, and pay the 75% balance when it arrives at Bole!

📌 *To get a quote:* Simply copy and paste any Shein link here!`;

  return ctx.replyWithMarkdown(
    welcomeText,
    Markup.inlineKeyboard([
      [Markup.button.webApp('🛍️ Open Korcha Store', 'https://korcha.com.et')],
      [
        Markup.button.callback('📦 Track Order', 'ACTION_TRACK'),
        Markup.button.url('💬 Talk to Worker', 'https://t.me/korcha_support')
      ]
    ])
  );
});

// 2. /help command
bot.help((ctx) => {
  ctx.replyWithMarkdown(
    `ℹ️ *Korcha Bot Commands:*\n\n` +
    `• *Paste any Shein URL* - Instant price quote with 25% deposit.\n` +
    `• \`/track <OrderNumber>\` - Track your 7–14 day air cargo.\n` +
    `• \`/support\` - Talk with a live Korcha operator.\n` +
    `• \`/pass\` - Get a 25 ETB Direct Shein Access Pass.`
  );
});

// 3. /support command
bot.command('support', (ctx) => {
  ctx.reply(
    `💬 Need help with an order, sizing, or payment?\n\n` +
    `• Telegram: @korcha_support\n` +
    `• Email: support@korcha.com.et`,
    Markup.inlineKeyboard([
      [Markup.button.url('💬 Chat with Worker Now', 'https://t.me/korcha_support')]
    ])
  );
});

// 4. /track command (e.g. /track KC-123456)
bot.command('track', async (ctx) => {
  const parts = ctx.message.text.split(' ');
  const orderNumber = parts?.trim();

  if (!orderNumber) {
    return ctx.reply('Please provide your order number:\nExample: `/track KC-123456`', { parse_mode: 'Markdown' });
  }

  try {
    const [orders] = await db.query(
      `SELECT order_number, product_title, total_etb, status, tracking_number, pickup_location, pricing_breakdown 
       FROM orders WHERE order_number = ?`,
      [orderNumber]
    );

    if (orders.length === 0) {
      return ctx.reply(`❌ Order *${orderNumber}* was not found. Please verify the code.`, { parse_mode: 'Markdown' });
    }

    const o = orders[0];
    const statusFormatted = o.status.replace(/_/g, ' ').toUpperCase();
    const breakdown = typeof o.pricing_breakdown === 'string' ? JSON.parse(o.pricing_breakdown) : o.pricing_breakdown;

    const response = 
`📦 *Order Status: #${o.order_number}*

🛍️ *Item:* ${o.product_title}
💰 *Full Total:* ${o.total_etb} ETB
${breakdown?.balanceDue ? `💵 *Balance Due on Pickup:* *${breakdown.balanceDue} ETB*\n` : ''}
📍 *Pickup:* ${o.pickup_location || 'Bole Hub'}
🚚 *Status:* *${statusFormatted}*
✈️ *Expected Delivery:* 7–14 Days via Air Cargo
${o.tracking_number ? `🔖 *Cargo AWB:* \`${o.tracking_number}\`` : ''}`;

    ctx.replyWithMarkdown(response);
  } catch (err) {
    ctx.reply('Error retrieving tracking details. Please try again.');
  }
});

bot.action('ACTION_TRACK', (ctx) => {
  ctx.reply('To track your package, send:\n`/track <OrderNumber>`\n\nExample: `/track KC-123456`', { parse_mode: 'Markdown' });
});

// 5. Automatic Shein link handler (Calculates 50% overhead + 25% deposit)
bot.on('text', async (ctx) => {
  const text = ctx.message.text.trim();

  if (text.includes('shein.') || text.includes('shein.top')) {
    const loadingMsg = await ctx.reply('⏳ Fetching Shein details and calculating 25% deposit...');

    try {
      const product = await parseProductUrl(text);

      if (!product.success) {
        return ctx.reply(`❌ ${product.error || 'Could not parse this Shein link.'}`);
      }

      const cost = await calculateLandedCost({ usdPrice: product.usdPrice });

      const caption = 
`🛍️ *${product.title}*

📦 *Air Cargo + Customs (+50%):* Included
✈️ *Delivery Window:* 7–14 Days to Addis Ababa
-----------------------------------
💰 *Total Landed Cost:* *${cost.totalETB} ETB*
⚡ *PAY 25% DEPOSIT NOW:* *${cost.depositETB} ETB*

_Remaining 75% balance (${cost.remainingETB} ETB) is payable upon pickup at Bole._`;

      await ctx.replyWithPhoto(product.imageUrl, {
        caption,
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard([
          [Markup.button.webApp('💳 Order Now (Pay 25% Deposit)', `https://korcha.com.et/?prefill=${encodeURIComponent(text)}`)],
          [Markup.button.url('💬 Ask Worker About This', 'https://t.me/korcha_support')]
        ])
      });

      ctx.telegram.deleteMessage(ctx.chat.id, loadingMsg.message_id).catch(() => {});
    } catch (error) {
      ctx.reply('❌ An error occurred while calculating the price. Please check the link.');
    }
  }
});