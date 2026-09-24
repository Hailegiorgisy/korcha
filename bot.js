import { Telegraf, Markup } from 'telegraf';
import axios from 'axios';
import 'dotenv/config';

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

bot.start((ctx) => {
  ctx.reply(
    `Welcome to Korcha (ኮርቻ)!\n\nPaste any Shein product link to see the total price in ETB (including air cargo & customs), or open our store below:`,
    Markup.inlineKeyboard([
      Markup.button.webApp('🛍️ Open Korcha Store', 'https://korcha.com.et'),
      Markup.button.url('💬 Chat with Agent', 'https://t.me/korcha_support')
    ])
  );
});

bot.on('text', async (ctx) => {
  const text = ctx.message.text;
  if (text.includes('shein.')) {
    ctx.reply('🔍 Fetching Shein item and calculating landed ETB price...');
    try {
      const res = await axios.post('https://korcha.com.et/api/parse-product', { url: text });
      const { product, cost } = res.data;

      const message = `🛍️ *${product.title}*\n\n` +
        `💵 Original: $${product.usdPrice}\n` +
        `📦 Cargo + Customs: ${cost.breakdown.freightETB + cost.breakdown.customsETB} ETB\n` +
        `🇪🇹 *Total to Pay:* *${cost.totalETB} ETB*\n\n` +
        `Click below to complete your order and pay with Telebirr/CBE:`;

      await ctx.replyWithPhoto(product.imageUrl, {
        caption: message,
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard([
          Markup.button.webApp('💳 Order & Pay', `https://korcha.com.et`)
        ])
      });
    } catch (err) {
      ctx.reply('❌ Could not extract details from this link. Please verify the URL.');
    }
  }
});

bot.launch();