import { Telegraf, Markup } from 'telegraf';
import db from '../config/db.js';
import 'dotenv/config';

export const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

const HERO_BANNER_URL = 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200&q=80';

// 1. /start command
bot.start(async (ctx) => {
  const welcomeCaption = 
`👑 *KORCHA (ኮርቻ) - Direct China to Ethiopia Shopping*
━━━━━━━━━━━━━━━━━━━━
✈️ *Air Cargo:* Guaranteed *7–14 Days* to Addis Ababa.
💳 *Payment:* Telebirr & CBE Birr Accepted.

🌟 *TWO WAYS TO PURCHASE ON EVERY ITEM:*
• *Option 1 (Direct Sourcing Pass - 25 ETB):* Connect directly with our operators to find and source this specific item.
• *Option 2 (25% Deposit Order):* Pay only *25% deposit* now. Pay the 75% balance when your parcel arrives at Bole!

━━━━━━━━━━━━━━━━━━━━
📌 *To find an item:* Simply type the product name below (e.g. "Floral dress", "Wireless earbuds", "Makeup set")!
Or browse our departments:`;

  await ctx.replyWithPhoto(HERO_BANNER_URL, {
    caption: welcomeCaption,
    parse_mode: 'Markdown',
    ...Markup.inlineKeyboard([
      [Markup.button.webApp('🛍️ Open Korcha Store App', 'https://korcha.com.et')],
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

// Category: Cosmetics
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

// Category: Electronics
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

// Category: Clothes
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
    `🛍️ *Main Menu:* Type any product name or pick a department:`,
    Markup.inlineKeyboard([
      [Markup.button.webApp('🛍️ Open Korcha Store App', 'https://korcha.com.et')],
      [
        Markup.button.callback('💄 Cosmetics', 'CAT_COSMETICS'),
        Markup.button.callback('🎧 Electronics', 'CAT_ELECTRONICS'),
        Markup.button.callback('👗 Clothes', 'CAT_CLOTHES')
      ]
    ])
  );
});

// Product Name Search in Bot
bot.on('text', async (ctx) => {
  const query = ctx.message.text.trim();
  if (query.startsWith('/')) return; // ignore commands

  const loadingMsg = await ctx.reply(`🔍 Sourcing items matching "${query}" from China...`);

  // Simple query matching against catalog
  const response = 
`📦 *Sourcing Results for: "${query}"*
━━━━━━━━━━━━━━━━━━━━
✈️ *Air Cargo Delivery:* 7–14 Days to Addis Ababa

We have found direct factory matches! You can:
1️⃣ *Option 2 (25% Deposit):* Place order with 25% advance payment and pay the 75% balance on arrival.
2️⃣ *Option 1 (25 ETB Pass):* Connect directly with our operator to review photos and sizing before purchasing.`;

  await ctx.reply(response, {
    parse_mode: 'Markdown',
    ...Markup.inlineKeyboard([
      [Markup.button.webApp('🛍️ View & Order in Store', 'https://korcha.com.et')],
      [Markup.button.url('💬 Chat with Operator About This Item', 'https://t.me/korcha_support')]
    ])
  });

  ctx.telegram.deleteMessage(ctx.chat.id, loadingMsg.message_id).catch(() => {});
});