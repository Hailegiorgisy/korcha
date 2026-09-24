import { Telegraf, Markup } from 'telegraf';
import { parseProductUrl } from './scraper.js';
import { calculateLandedCost } from './calculator.js';
import db from '../config/db.js';
import 'dotenv/config';

export const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

const HERO_BANNER_URL = 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200&q=80';

// 1. /start command
bot.start(async (ctx) => {
  const welcomeCaption = 
`👑 *KORCHA (ኮርቻ) - Custom Shein Concierge & Import*
━━━━━━━━━━━━━━━━━━━━
✈️ *Air Cargo Delivery:* Guaranteed *7–14 Days* to Addis Ababa.
💳 *Payment:* Telebirr & CBE Birr Accepted.

🌟 *TWO WAYS TO PURCHASE ON EVERY ITEM:*
• *Option 1 (Shein Link Pass - 25 ETB):* Direct concierge connection to order through our personal shopping team.
• *Option 2 (25% Deposit Order):* Pay only *25% deposit* now. Pay the 75% balance when your parcel arrives at Bole!

━━━━━━━━━━━━━━━━━━━━
📌 *To get an instant quote:* Paste any Shein product link below!
Or browse our multi-item departments:`;

  await ctx.replyWithPhoto(HERO_BANNER_URL, {
    caption: welcomeCaption,
    parse_mode: 'Markdown',
    ...Markup.inlineKeyboard([
      [Markup.button.webApp('🛍️ Launch Korcha Store App', 'https://korcha.com.et')],
      [
        Markup.button.callback('💄 Cosmetics (10 items)', 'CAT_COSMETICS'),
        Markup.button.callback('🎧 Electronics (10 items)', 'CAT_ELECTRONICS')
      ],
      [
        Markup.button.callback('👗 Clothes & Bags (10 items)', 'CAT_CLOTHES'),
        Markup.button.callback('📦 Track Cargo (7–14 Days)', 'ACTION_TRACK')
      ],
      [
        Markup.button.url('💬 Chat with Worker (@korcha_support)', 'https://t.me/korcha_support')
      ]
    ])
  });
});

// Category: Cosmetics (Multi-Item List)
bot.action('CAT_COSMETICS', async (ctx) => {
  await ctx.answerCbQuery();
  const text = 
`💄 *Cosmetics & Beauty Department*
━━━━━━━━━━━━━━━━━━━━
1️⃣ *12-Color Eye Shadow Palette* - 1,500 ETB
   • Option 2: 25% Deposit = *375 ETB* | Option 1: *25 ETB Pass*

2️⃣ *6-Pcs Matte Lip Gloss Set* - 1,200 ETB
   • Option 2: 25% Deposit = *300 ETB* | Option 1: *25 ETB Pass*

3️⃣ *15-Pcs Makeup Brush Set* - 1,800 ETB
   • Option 2: 25% Deposit = *450 ETB* | Option 1: *25 ETB Pass*

4️⃣ *Waterproof Foundation 30ml* - 1,400 ETB
   • Option 2: 25% Deposit = *350 ETB* | Option 1: *25 ETB Pass*

5️⃣ *Rechargeable LED Travel Mirror* - 2,250 ETB
   • Option 2: 25% Deposit = *563 ETB* | Option 1: *25 ETB Pass*

✈️ *Guaranteed 7–14 Days Delivery via Air Cargo.*`;

  await ctx.replyWithPhoto('https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=700&q=80', {
    caption: text,
    parse_mode: 'Markdown',
    ...Markup.inlineKeyboard([
      [Markup.button.webApp('🛍️ View All 10+ Cosmetics in Store', 'https://korcha.com.et')],
      [Markup.button.callback('⬅️ Back to Menu', 'ACTION_MENU')]
    ])
  });
});

// Category: Electronics (Multi-Item List)
bot.action('CAT_ELECTRONICS', async (ctx) => {
  await ctx.answerCbQuery();
  const text = 
`🎧 *Electronics & Gadgets Department*
━━━━━━━━━━━━━━━━━━━━
1️⃣ *TWS Bluetooth 5.3 Earbuds* - 2,200 ETB
   • Option 2: 25% Deposit = *550 ETB* | Option 1: *25 ETB Pass*

2️⃣ *Full Touch Smartwatch* - 3,200 ETB
   • Option 2: 25% Deposit = *800 ETB* | Option 1: *25 ETB Pass*

3️⃣ *10-inch Desktop RGB Ring Light* - 2,500 ETB
   • Option 2: 25% Deposit = *625 ETB* | Option 1: *25 ETB Pass*

4️⃣ *3-in-1 Fast Wireless Charger* - 3,000 ETB
   • Option 2: 25% Deposit = *750 ETB* | Option 1: *25 ETB Pass*

5️⃣ *Active Noise Cancelling Headphones* - 4,125 ETB
   • Option 2: 25% Deposit = *1,031 ETB* | Option 1: *25 ETB Pass*

✈️ *Guaranteed 7–14 Days Delivery via Air Cargo.*`;

  await ctx.replyWithPhoto('https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=700&q=80', {
    caption: text,
    parse_mode: 'Markdown',
    ...Markup.inlineKeyboard([
      [Markup.button.webApp('🛍️ View All 10+ Electronics in Store', 'https://korcha.com.et')],
      [Markup.button.callback('⬅️ Back to Menu', 'ACTION_MENU')]
    ])
  });
});

// Category: Clothes (Multi-Item List)
bot.action('CAT_CLOTHES', async (ctx) => {
  await ctx.answerCbQuery();
  const text = 
`👗 *Fashion & Apparel Department*
━━━━━━━━━━━━━━━━━━━━
1️⃣ *Floral Summer Maxi Dress* - 2,800 ETB
   • Option 2: 25% Deposit = *700 ETB* | Option 1: *25 ETB Pass*

2️⃣ *Men Lightweight Linen Shirt* - 2,400 ETB
   • Option 2: 25% Deposit = *600 ETB* | Option 1: *25 ETB Pass*

3️⃣ *Quilted Vegan Leather Crossbody* - 3,000 ETB
   • Option 2: 25% Deposit = *750 ETB* | Option 1: *25 ETB Pass*

4️⃣ *Chunky Platform White Sneakers* - 3,375 ETB
   • Option 2: 25% Deposit = *844 ETB* | Option 1: *25 ETB Pass*

5️⃣ *Casual Double-Breasted Trench Coat* - 4,680 ETB
   • Option 2: 25% Deposit = *1,170 ETB* | Option 1: *25 ETB Pass*

✈️ *Guaranteed 7–14 Days Delivery via Air Cargo.*`;

  await ctx.replyWithPhoto('https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=700&q=80', {
    caption: text,
    parse_mode: 'Markdown',
    ...Markup.inlineKeyboard([
      [Markup.button.webApp('🛍️ View All 10+ Fashion Items in Store', 'https://korcha.com.et')],
      [Markup.button.callback('⬅️ Back to Menu', 'ACTION_MENU')]
    ])
  });
});

bot.action('ACTION_MENU', async (ctx) => {
  await ctx.answerCbQuery();
  ctx.reply(
    `🛍️ *Main Catalog:* Select a category or paste any Shein link:`,
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

bot.action('ACTION_TRACK', async (ctx) => {
  await ctx.answerCbQuery();
  ctx.reply('To track your 7–14 day air cargo, send:\n`/track <OrderNumber>`\n\nExample: `/track KC-123456`', { parse_mode: 'Markdown' });
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
💰 *Total Landed Cost:* ${o.total_etb} ETB
${breakdown?.balanceDue ? `💵 *Balance Due on Pickup:* *${breakdown.balanceDue} ETB*\n` : ''}
📍 *Pickup:* ${o.pickup_location || 'Bole Medhanialem Hub'}
🚚 *Status:* *${statusFormatted}*
✈️ *Expected Delivery:* 7–14 Days via Air Cargo
${o.tracking_number ? `🔖 *Cargo AWB:* \`${o.tracking_number}\`` : ''}`;

    ctx.replyWithMarkdown(response);
  } catch (err) {
    ctx.reply('Error retrieving tracking details. Please try again.');
  }
});

// Shein Link Parser Handler
bot.on('text', async (ctx) => {
  const text = ctx.message.text.trim();

  if (text.includes('shein.') || text.includes('shein.top')) {
    const loadingMsg = await ctx.reply('⏳ Calculating verified all-inclusive landed quote...');

    try {
      const product = await parseProductUrl(text);

      if (!product.success) {
        return ctx.reply(`❌ ${product.error || 'Could not parse this Shein link.'}`);
      }

      const cost = await calculateLandedCost({ usdPrice: product.usdPrice });

      const caption = 
`🛍️ *${product.title}*

✈️ *Guaranteed Air Cargo:* 7–14 Days to Addis Ababa
━━━━━━━━━━━━━━━━━━━━
💰 *All-Inclusive Landed Cost:* *${cost.totalETB} ETB*

🌟 *TWO OPTIONS TO PURCHASE:*
• *Option 2 (25% Deposit):* Pay *${cost.depositETB} ETB* now. Pay the 75% balance (${cost.remainingETB} ETB) on arrival!
• *Option 1 (Shein Link Pass):* Pay *25 ETB* for direct concierge connection.`;

      await ctx.replyWithPhoto(product.imageUrl, {
        caption,
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard([
          [Markup.button.webApp('💳 Order with 25% Deposit', `https://korcha.com.et/?prefill=${encodeURIComponent(text)}`)],
          [Markup.button.url('💬 Chat with Worker About This', 'https://t.me/korcha_support')]
        ])
      });

      ctx.telegram.deleteMessage(ctx.chat.id, loadingMsg.message_id).catch(() => {});
    } catch (error) {
      ctx.reply('❌ An error occurred while calculating the price. Please check the link.');
    }
  }
});