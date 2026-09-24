import { Telegraf, Markup } from 'telegraf';
import { parseProductUrl } from './scraper.js';
import { calculateLandedCost } from './calculator.js';
import db from '../config/db.js';
import 'dotenv/config';

export const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

// High-quality e-commerce banner image
const HERO_BANNER_URL = 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200&q=80';

// 1. /start command - Attractive Visual Hero
bot.start(async (ctx) => {
  const welcomeCaption = 
`👑 *KORCHA (ኮርቻ) - Shein Shopping in Ethiopia*
━━━━━━━━━━━━━━━━━━━━
✈️ *Delivery:* Guaranteed *7–14 Days* via Air Cargo (Guangzhou $\\rightarrow$ Bole Addis Ababa).
💳 *Payment:* Telebirr & CBE Birr Accepted.

🌟 *CHOOSE YOUR SHOPPING OPTION:*

1️⃣ *Option 1: Direct Shein Access Pass (25 ETB)*
Unlock personal shopping assistance to browse millions of items directly on Shein China.

2️⃣ *Option 2: Order with 25% Down Payment*
Pick any product, pay only *25% deposit* upfront, and pay the remaining 75% when your parcel arrives at Bole!

━━━━━━━━━━━━━━━━━━━━
📌 *To get a quote:* Paste any Shein product link below!
Or explore our curated departments:`;

  await ctx.replyWithPhoto(HERO_BANNER_URL, {
    caption: welcomeCaption,
    parse_mode: 'Markdown',
    ...Markup.inlineKeyboard([
      [Markup.button.webApp('🛍️ Launch Korcha Store App', 'https://korcha.com.et')],
      [
        Markup.button.callback('💄 Cosmetics', 'CAT_COSMETICS'),
        Markup.button.callback('🎧 Electronics', 'CAT_ELECTRONICS'),
        Markup.button.callback('👗 Clothes', 'CAT_CLOTHES')
      ],
      [
        Markup.button.callback('🎟️ Get 25 ETB Shein Pass', 'ACTION_PASS'),
        Markup.button.callback('📦 Track Cargo', 'ACTION_TRACK')
      ],
      [
        Markup.button.url('💬 Chat with Worker (@korcha_support)', 'https://t.me/korcha_support')
      ]
    ])
  });
});

// Category: Cosmetics
bot.action('CAT_COSMETICS', async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.replyWithPhoto('https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=700&q=80', {
    caption: 
`💄 *Cosmetics & Beauty Department*
━━━━━━━━━━━━━━━━━━━━
• Eye Shadow & Highlighter Palette - *1,500 ETB* (Deposit: *375 ETB*)
• Hydrating Matte Lip Gloss Set - *1,200 ETB* (Deposit: *300 ETB*)
• Professional Makeup Brush Set - *1,800 ETB* (Deposit: *450 ETB*)

✈️ *Delivered in 7–14 days to Addis Ababa!*`,
    parse_mode: 'Markdown',
    ...Markup.inlineKeyboard([
      [Markup.button.webApp('🛍️ View All Cosmetics in Store', 'https://korcha.com.et')],
      [Markup.button.callback('⬅️ Back to Menu', 'ACTION_MENU')]
    ])
  });
});

// Category: Electronics
bot.action('CAT_ELECTRONICS', async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.replyWithPhoto('https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=700&q=80', {
    caption: 
`🎧 *Electronics & Gadgets Department*
━━━━━━━━━━━━━━━━━━━━
• Bluetooth Wireless Earbuds - *2,200 ETB* (Deposit: *550 ETB*)
• Ultra-Thin Smart Fitness Watch - *3,200 ETB* (Deposit: *800 ETB*)
• Studio Ring Light & Tripod - *2,500 ETB* (Deposit: *625 ETB*)

✈️ *Delivered in 7–14 days to Addis Ababa!*`,
    parse_mode: 'Markdown',
    ...Markup.inlineKeyboard([
      [Markup.button.webApp('🛍️ View All Electronics in Store', 'https://korcha.com.et')],
      [Markup.button.callback('⬅️ Back to Menu', 'ACTION_MENU')]
    ])
  });
});

// Category: Clothes
bot.action('CAT_CLOTHES', async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.replyWithPhoto('https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=700&q=80', {
    caption: 
`👗 *Fashion & Apparel Department*
━━━━━━━━━━━━━━━━━━━━
• Floral High-Waist Summer Dress - *2,800 ETB* (Deposit: *700 ETB*)
• Men Casual Linen Shirt - *2,400 ETB* (Deposit: *600 ETB*)
• Leather Crossbody Shoulder Bag - *3,000 ETB* (Deposit: *750 ETB*)

✈️ *Delivered in 7–14 days to Addis Ababa!*`,
    parse_mode: 'Markdown',
    ...Markup.inlineKeyboard([
      [Markup.button.webApp('🛍️ View All Fashion in Store', 'https://korcha.com.et')],
      [Markup.button.callback('⬅️ Back to Menu', 'ACTION_MENU')]
    ])
  });
});

// Action: Option 1 (25 ETB Pass)
bot.action('ACTION_PASS', async (ctx) => {
  await ctx.answerCbQuery();
  ctx.reply(
    `🎟️ *Direct Shein Access Pass (25 ETB)*\n\n` +
    `Get personal concierge access to browse the live Shein China catalog and place custom requests.\n\n` +
    `Click below to pay your 25 ETB pass via Telebirr or CBE Birr:`,
    {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard([
        [Markup.button.webApp('💳 Pay 25 ETB Access Pass', 'https://korcha.com.et')],
        [Markup.button.url('💬 Ask Support on Telegram', 'https://t.me/korcha_support')]
      ])
    }
  );
});

// Action: Return to menu
bot.action('ACTION_MENU', async (ctx) => {
  await ctx.answerCbQuery();
  ctx.reply(
    `🛍️ *Main Menu:* Choose an option or paste any Shein link:`,
    Markup.inlineKeyboard([
      [Markup.button.webApp('🛍️ Launch Korcha Store App', 'https://korcha.com.et')],
      [
        Markup.button.callback('💄 Cosmetics', 'CAT_COSMETICS'),
        Markup.button.callback('🎧 Electronics', 'CAT_ELECTRONICS'),
        Markup.button.callback('👗 Clothes', 'CAT_CLOTHES')
      ]
    ])
  );
});

// Action: Track Order
bot.action('ACTION_TRACK', async (ctx) => {
  await ctx.answerCbQuery();
  ctx.reply('To track your package, send:\n`/track <OrderNumber>`\n\nExample: `/track KC-123456`', { parse_mode: 'Markdown' });
});

// /track command handler
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
      return ctx.reply(`❌ Order *${orderNumber}* was not found. Please verify your order number.`, { parse_mode: 'Markdown' });
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

// Automatic Shein link handler
bot.on('text', async (ctx) => {
  const text = ctx.message.text.trim();

  if (text.includes('shein.') || text.includes('shein.top')) {
    const loadingMsg = await ctx.reply('⏳ Fetching Shein item and calculating 25% deposit...');

    try {
      const product = await parseProductUrl(text);

      if (!product.success) {
        return ctx.reply(`❌ ${product.error || 'Could not parse this Shein link.'}`);
      }

      const cost = await calculateLandedCost({ usdPrice: product.usdPrice });

      const caption = 
`🛍️ *${product.title}*

📦 *Air Cargo + Customs (+50%):* Included
✈️ *Guaranteed Delivery:* 7–14 Days to Addis Ababa
━━━━━━━━━━━━━━━━━━━━
💰 *Total Landed Cost:* *${cost.totalETB} ETB*
⚡ *PAY 25% DEPOSIT NOW:* *${cost.depositETB} ETB*

_Remaining 75% balance (${cost.remainingETB} ETB) is payable upon pickup at Bole._`;

      await ctx.replyWithPhoto(product.imageUrl, {
        caption,
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard([
          [Markup.button.webApp('💳 Order Now (Pay 25% Deposit)', `https://korcha.com.et/?prefill=${encodeURIComponent(text)}`)],
          [Markup.button.url('💬 Chat with Worker About This', 'https://t.me/korcha_support')]
        ])
      });

      ctx.telegram.deleteMessage(ctx.chat.id, loadingMsg.message_id).catch(() => {});
    } catch (error) {
      ctx.reply('❌ An error occurred while calculating the price. Please check the link.');
    }
  }
});