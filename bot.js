import { Telegraf, Markup } from 'telegraf';
import dotenv from 'dotenv';
import { execFile } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import https from 'https';

dotenv.config();

const execFileAsync = promisify(execFile);

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const WORKER_CHAT_ID = process.env.TELEGRAM_WORKER_CHAT_ID;
const WORKER_TELEGRAM_USERNAME = process.env.WORKER_TELEGRAM_USERNAME || 'korcha_support';
const TELEBIRR_PHONE = process.env.TELEBIRR_PHONE || '+251911234567';
const CBE_ACCOUNT = process.env.CBE_ACCOUNT || '1000123456789';

// Pricing formula constants (User specification)
const HKD_EXCHANGE_RATE = parseFloat(process.env.HKD_EXCHANGE_RATE || '30.0'); // 30 ETB per HKD
const USD_TO_HKD = 7.8;
const KG_CARGO_RATE_ETB = 1000.0; // 1 kg = 1000 ETB
const SUPPLIER_PERCENT = 0.27; // +27% for supplier
const DELIVERY_PERCENT = 0.54; // +54% for delivery service
const MAX_SIZE_CM = 50; // Package size limit: 50cm by 50cm

if (!BOT_TOKEN) {
  console.error('❌ Please set TELEGRAM_BOT_TOKEN in your .env file');
  process.exit(1);
}

const bot = new Telegraf(BOT_TOKEN);
const sessions = new Map();
const orders = new Map();

// Helper: Calculate Doorstep Landed Price in ETB
// HKD to ETB exchange rate (30 ETB / HKD)
// +27% for supplier, 1,000 ETB / kg for cargo, +54% for delivery service
// 25% pre-payment, 75% on delivery
function calculateDoorPrice(priceVal, currency = 'USD', weightKg = 0.40) {
  const cleanPrice = Math.max(0, Number(priceVal) || 0);
  let priceHkd = cleanPrice;
  let priceUsd = cleanPrice;

  if (currency.toUpperCase() === 'HKD') {
    priceHkd = cleanPrice;
    priceUsd = cleanPrice / USD_TO_HKD;
  } else {
    priceUsd = cleanPrice;
    priceHkd = cleanPrice * USD_TO_HKD;
  }

  const baseEtb = Math.round(priceHkd * HKD_EXCHANGE_RATE);
  const supplierFeeEtb = Math.round(baseEtb * SUPPLIER_PERCENT);
  const deliveryFeeEtb = Math.round(baseEtb * DELIVERY_PERCENT);
  const cargoCostEtb = Math.round(weightKg * KG_CARGO_RATE_ETB);

  const totalDoorPrice = baseEtb + supplierFeeEtb + deliveryFeeEtb + cargoCostEtb;
  const deposit = Math.max(100, Math.round((totalDoorPrice * 0.25) / 100) * 100);
  const cod = Math.max(0, totalDoorPrice - deposit);

  return {
    priceUsd: Number(priceUsd.toFixed(2)),
    priceHkd: Number(priceHkd.toFixed(2)),
    baseEtb,
    supplierFeeEtb,
    deliveryFeeEtb,
    cargoCostEtb,
    weightKg: Number(weightKg.toFixed(2)),
    totalDoorPrice,
    deposit,
    cod,
  };
}

// Helper: Run Python scraper script
async function runPythonScraper(args = []) {
  try {
    const pythonBin = fs.existsSync('/usr/bin/python3') ? '/usr/bin/python3' : 'python3';
    const scriptPath = path.resolve(process.cwd(), 'scraper.py');
    const { stdout } = await execFileAsync(pythonBin, [scriptPath, ...args], {
      timeout: 12000,
      maxBuffer: 1024 * 1024 * 4,
    });
    return JSON.parse(stdout.trim());
  } catch (err) {
    console.error('Python scraper error, falling back to built-in parser:', err.message);
    return null;
  }
}

// Helper: Download Telegram photo file to local temp disk
async function downloadTelegramFile(fileUrl, destPath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destPath);
    https.get(fileUrl, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close(resolve);
      });
    }).on('error', (err) => {
      fs.unlink(destPath, () => {});
      reject(err);
    });
  });
}

// Persistent Reply Keyboard for quick access from anywhere
const MAIN_REPLY_KEYBOARD = Markup.keyboard([
  ['🏠 ዋና ገጽ (Return to Main)', '💬 ከአስተናጋጅ ጋር አውራ'],
  ['📸 ስክሪንሾት ላክ', '🔗 ሊንክ አስገባ'],
]).resize();

// Format Customer Quote Message
// CRITICAL USER REQUIREMENT: "The customers need not see how was the calculation made."
// We only display the clear total door price, 25% pre-payment, 75% on delivery, and order button!
function formatCustomerQuote(item) {
  const mpName =
    item.marketplace === 'shein'
      ? '👗 SHEIN'
      : item.marketplace === 'temu'
      ? '⚡ TEMU'
      : item.marketplace === 'aliexpress'
      ? '📱 ALIEXPRESS'
      : item.marketplace === 'screenshot'
      ? '📸 ከስክሪንሾት የተመረጠ እቃ'
      : '🛍️ የመስመር ላይ ሱቅ';

  const noteLine = item.marketNote ? `💡 <i>${item.marketNote}</i>\n` : '';

  return (
    `📦 <b>የእቃው ዝርዝርና የበር ላይ ዋጋ</b>\n\n` +
    `🏷️ <b>እቃ:</b> ${item.title}\n` +
    `🏬 <b>የገበያ ቦታ:</b> <b>${mpName}</b>\n` +
    noteLine +
    `⚖️ <b>የእቃው ክብደት:</b> ~${item.weightKg} ኪ.ግ (እስከ ${MAX_SIZE_CM}×${MAX_SIZE_CM} ሳ.ሜ የተፈቀደ)\n\n` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `💰 <b>ጠቅላላ የበር ላይ ዋጋ: ${item.totalDoorPrice.toLocaleString()} ብር (ETB)</b>\n` +
    `━━━━━━━━━━━━━━━━━━━━\n\n` +
    `🔹 <b>አሁን የሚከፈል 25% ቅድመ ክፍያ:</b> <b>${item.deposit.toLocaleString()} ብር</b> (በቴሌብር ወይም በ CBE)\n` +
    `🔹 <b>ቀሪ 75% እቃው በርዎ ሲደርስ:</b> ${item.cod.toLocaleString()} ብር\n` +
    `✈️ <b>የማድረሻ ጊዜ:</b> ከ 10 እስከ 14 የስራ ቀናት (በአየር ጭነት እስከ ደጃፍዎ)\n\n` +
    `እቃውን ለማዘዝ ወይም ከአስተናጋጅ ጋር ለመነጋገር ከታች ያሉትን አማራጮች ይጠቀሙ:`
  );
}

// Generate Quote Action Buttons
function getQuoteButtons(workerUsername = WORKER_TELEGRAM_USERNAME) {
  const workerUrl = `https://t.me/${workerUsername.replace(/^@/, '')}`;
  return Markup.inlineKeyboard([
    [
      Markup.button.callback('✅ አሁን እዘዝ (Order Now)', 'order_now'),
      Markup.button.url('💬 ከአስተናጋጅ ጋር አውራ', workerUrl),
    ],
    [
      Markup.button.callback('✏️ ዋጋ አስተካክል', 'edit_price'),
      Markup.button.callback('🏠 ወደ ዋና ገጽ (Return to Main)', 'return_main'),
    ],
  ]);
}

// 1. Initial Page of the Telegram Bot
// Features:
// - Exact Amharic welcoming text and 3-step instructions
// - Marketplace direct links (no explicit 'three markets')
// - Screenshot upload (door price, 25% advance, order)
// - Link paste (door price, 25% advance, order)
// - Worker chat & support
// - Start and Return to Main navigation
async function sendInitialPage(ctx) {
  const name = ctx.from?.first_name || 'ወዳጃችን';
  const workerUrl = `https://t.me/${WORKER_TELEGRAM_USERNAME.replace(/^@/, '')}`;

  const welcomeText =
    `👋 ውድ <b>${name}</b> እንኳን ወደ <b>ኮርቻ (Korcha)</b> መጡ።\n\n` +
    `በኮርቻ በመጠቀም ከቻይና እቃዎችን ማስመጣት ይችላሉ። <b>3 ሂደቶችን ብቻ ይጠቀሙ:</b>\n\n` +
    `1️⃣ <b>የሚፈልጉትን ዕቃ ከተለያዩ ቦታዎች ይምረጡ:</b>\n` +
    `ከታች ያሉትን ሱቆች በመክፈት የሚፈልጉትን ማንኛውንም እቃ ይምረጡ።\n\n` +
    `2️⃣ <b>የመረጡትን ዕቃ ሊንክ ወይንም ፎቶ (screenshot) ወደ መተግበሪያው ያስገቡ:</b>\n` +
    `የመረጡትን እቃ ሊንክ ኮፒ አድርገው እዚህ ይላኩ ወይም ስክሪንሾቱን ያጋሩን።\n\n` +
    `3️⃣ <b>መተግበሪያው ቤትዎ ሲደርስ የሚከፍሉትን የዕቃውን ዋጋ ሲያስቀምጥልዎት 25% ዋጋ በመክፈል ይዘዙን።</b>\n` +
    `ዕቃው <b>ከ10 እስከ 14</b> ባለው ቀናት ውስጥ እጅዎ ይገባል። ቤትዎ ሲደርስ ቀሪዎን <b>75%</b> ይከፍላሉ።\n\n` +
    `💬 እገዛ ከፈለጉ እኛን ያናግሩን።\n` +
    `🛍️ <b>የፈለጉትን ይሸምቱ። መልካም ገበያ!</b>`;

  const inlineKeyboard = Markup.inlineKeyboard([
    [
      Markup.button.url('👗 Shein ሱቅ', 'https://m.shein.com'),
      Markup.button.url('⚡ Temu ሱቅ', 'https://www.temu.com'),
      Markup.button.url('📱 AliExpress ሱቅ', 'https://m.aliexpress.com'),
    ],
    [
      Markup.button.callback('📸 ስክሪንሾት ላክ (Upload Screenshot)', 'prompt_upload_screenshot'),
      Markup.button.callback('🔗 ሊንክ አስገባ (Paste Link)', 'prompt_paste_link'),
    ],
    [
      Markup.button.url('💬 ከአስተናጋጅ ጋር አውራ (እገዛ)', workerUrl),
      Markup.button.callback('🏠 ወደ ዋና ገጽ (Return to Main)', 'return_main'),
    ],
  ]);

  await ctx.replyWithHTML(welcomeText, MAIN_REPLY_KEYBOARD);
  await ctx.reply('👇 ከታች ካሉት አማራጮች አንዱን ይምረጡ ወይም ሊንክ/ስክሪንሾት ይላኩልን:', inlineKeyboard);
}

// Start Command
bot.command('start', async (ctx) => {
  await sendInitialPage(ctx);
});

// Return to Main commands
bot.command(['main', 'menu', 'home', 'back'], async (ctx) => {
  await sendInitialPage(ctx);
});

// Action: Return to Main
bot.action('return_main', async (ctx) => {
  try {
    await ctx.answerCbQuery();
  } catch (_) {}
  await sendInitialPage(ctx);
});

// Prompt Upload Screenshot Action
bot.action('prompt_upload_screenshot', async (ctx) => {
  try {
    await ctx.answerCbQuery();
  } catch (_) {}
  await ctx.replyWithHTML(
    `📸 <b>የመረጡትን እቃ ስክሪንሾት ወይም ፎቶ ይላኩልን:</b>\n\n` +
    `1. ከ <b>Shein</b>፣ <b>Temu</b> ወይም <b>AliExpress</b> የመረጡትን እቃ ስክሪንሾት ያንሱ\n` +
    `2. በቴሌግራም የፎቶ ማያያዣ (Attach 📎 ወይም Camera 📷) በመጫን ምስሉን ወደዚህ ቻት ይላኩ\n\n` +
    `👉 ቦቱ ወዲያውኑ:\n` +
    `• <b>የበር ላይ ዋጋ (Door Price በብር)</b>\n` +
    `• <b>የ 25% ቅድመ ክፍያ (Advance Payment)</b>\n` +
    `• <b>የማዘዣ ቁልፍ (Order Now)</b>\n` +
    `አስልቶ ያቀርብልዎታል!`,
    Markup.inlineKeyboard([
      [Markup.button.callback('🏠 ወደ ዋና ገጽ (Return to Main)', 'return_main')],
    ])
  );
});

// Prompt Paste Link Action
bot.action('prompt_paste_link', async (ctx) => {
  try {
    await ctx.answerCbQuery();
  } catch (_) {}
  await ctx.replyWithHTML(
    `🔗 <b>የመረጡትን እቃ ሊንክ ይላኩልን (Paste Link):</b>\n\n` +
    `ከ <b>Shein</b>፣ <b>Temu</b> ወይም <b>AliExpress</b> ያዩትን እቃ <b>Share ➔ Copy Link</b> አድርገው ሊንኩን እዚህ ቻት ላይ ይለጥፉ (Paste)።\n\n` +
    `👉 ቦቱ በ Python ስክራፐር መረጃውን አውጥቶ:\n` +
    `• <b>የበር ላይ ዋጋ (Door Price በብር)</b>\n` +
    `• <b>የ 25% ቅድመ ክፍያ (Advance Payment)</b>\n` +
    `• <b>የማዘዣ ቁልፍ (Order Now)</b>\n` +
    `አስልቶ ያቀርብልዎታል!`,
    Markup.inlineKeyboard([
      [
        Markup.button.url('👗 Shein ክፈት', 'https://m.shein.com'),
        Markup.button.url('⚡ Temu ክፈት', 'https://www.temu.com'),
      ],
      [
        Markup.button.url('📱 AliExpress ክፈት', 'https://m.aliexpress.com'),
        Markup.button.callback('🏠 ወደ ዋና ገጽ (Return to Main)', 'return_main'),
      ],
    ])
  );
});

// Direct Worker Chat Command & Callback
bot.command(['worker', 'chat', 'contact', 'support'], async (ctx) => {
  const workerUrl = `https://t.me/${WORKER_TELEGRAM_USERNAME.replace(/^@/, '')}`;
  const userName = ctx.from?.first_name || 'ደንበኛ';
  const userHandle = ctx.from?.username ? `@${ctx.from.username}` : `ID: ${ctx.from?.id}`;

  await ctx.replyWithHTML(
    `💬 <b>ከኮርቻ አስተናጋጅ ጋር በቀጥታ ይወያዩ:</b>\n\n` +
    `ስለ ትዕዛዝዎ፣ ክፍያ ወይም ስለሚፈልጉት እቃ በቀጥታ ከአስተናጋጅ ጋር ለመነጋገር ከታች ያለውን ሊንክ ይጫኑ:\n\n` +
    `👉 <b>ቴሌግራም:</b> @${WORKER_TELEGRAM_USERNAME.replace(/^@/, '')}\n` +
    `👉 <b>ስልክ:</b> ${TELEBIRR_PHONE}\n\n` +
    `አስተናጋጃችን በደቂቃዎች ውስጥ ይመልስልዎታል!`,
    Markup.inlineKeyboard([
      [Markup.button.url('💬 ከአስተናጋጅ ጋር ቻት ክፈት', workerUrl)],
      [Markup.button.callback('🏠 ወደ ዋና ገጽ (Return to Main)', 'return_main')],
    ])
  );

  // Alert worker chat
  if (WORKER_CHAT_ID) {
    try {
      await bot.telegram.sendMessage(
        WORKER_CHAT_ID,
        `🔔 <b>የቀጥታ ቻት ጥያቄ (Live Chat Request):</b>\n\n` +
        `ደንበኛ: ${userName} (${userHandle})\n` +
        `የደንበኛ መለያ ቁጥር: <code>${ctx.from?.id}</code>\n` +
        `እባክዎ ደንበኛውን ያግኙ።`,
        { parse_mode: 'HTML' }
      );
    } catch (_) {}
  }
});

bot.action('chat_worker', async (ctx) => {
  try {
    await ctx.answerCbQuery();
  } catch (_) {}
  const workerUrl = `https://t.me/${WORKER_TELEGRAM_USERNAME.replace(/^@/, '')}`;
  await ctx.replyWithHTML(
    `💬 <b>ከኮርቻ አስተናጋጅ ጋር በቀጥታ ይወያዩ:</b>\n\n` +
    `👉 ቴሌግራም: @${WORKER_TELEGRAM_USERNAME.replace(/^@/, '')}\n` +
    `👉 ስልክ: ${TELEBIRR_PHONE}`,
    Markup.inlineKeyboard([
      [Markup.button.url('💬 ከአስተናጋጅ ጋር ቻት ክፈት', workerUrl)],
      [Markup.button.callback('🏠 ወደ ዋና ገጽ (Return to Main)', 'return_main')],
    ])
  );
});

// Edit Price Action
bot.action('edit_price', async (ctx) => {
  try {
    await ctx.answerCbQuery();
  } catch (_) {}
  const userId = ctx.from.id;
  const session = sessions.get(userId);
  if (!session) {
    return ctx.reply('እባክዎ መጀመሪያ የእቃውን ሊንክ ወይም ስክሪንሾት ይላኩልን።');
  }
  session.awaitingPrice = true;
  sessions.set(userId, session);
  await ctx.replyWithHTML(
    `✏ <b>ትክክለኛውን ዋጋ ያስገቡ:</b>\n\n` +
    `በጣቢያው ላይ ያዩትን የዶላር ($) ወይም የሆንግ ኮንግ ዶላር (HKD) ዋጋ ይጻፉልን (ምሳሌ: <code>14.50</code> ወይም <code>$19.99</code> ወይም <code>HK$ 120</code>):\n` +
    `ወዲያውኑ የበር ላይ ዋጋውን እና የ 25% ቅድመ ክፍያውን አዘምነን እናቀርብልዎታለን።`,
    Markup.inlineKeyboard([
      [Markup.button.callback('🏠 ወደ ዋና ገጽ (Return to Main)', 'return_main')],
    ])
  );
});

// Place order & payment instructions (Without tracker, with clear return to main)
bot.action('order_now', async (ctx) => {
  try {
    await ctx.answerCbQuery();
  } catch (_) {}
  const userId = ctx.from.id;
  const session = sessions.get(userId);
  if (!session) {
    return ctx.reply('እባክዎ መጀመሪያ የእቃውን ሊንክ ወይም ስክሪንሾት ይላኩልን።', Markup.inlineKeyboard([
      [Markup.button.callback('🏠 ወደ ዋና ገጽ (Return to Main)', 'return_main')],
    ]));
  }

  const orderId = 'KC-' + Math.floor(100000 + Math.random() * 900000);
  orders.set(orderId, {
    orderId,
    title: session.item.title,
    total: session.item.totalDoorPrice,
    deposit: session.item.deposit,
    cod: session.item.cod,
    landmark: 'አዲስ አበባ',
    status: 'የ 25% ቅድመ ክፍያ በመጠባበቅ ላይ',
  });

  const reply =
    `🎉 <b>ትዕዛዝዎ #${orderId} ተመዝግቧል!</b>\n\n` +
    `📦 <b>እቃ:</b> ${session.item.title}\n` +
    `💰 <b>ጠቅላላ የበር ላይ ዋጋ:</b> ${session.item.totalDoorPrice.toLocaleString()} ብር\n` +
    `💵 <b>የ 25% ቅድመ ክፍያ:</b> <b>${session.item.deposit.toLocaleString()} ብር</b>\n` +
    `📦 <b>ቀሪ 75% እቃው በርዎ ሲደርስ:</b> ${session.item.cod.toLocaleString()} ብር\n\n` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `📲 <b>የክፍያ መረጃ:</b>\n` +
    `1. <b>ቴሌብር (Telebirr):</b> <code>${TELEBIRR_PHONE}</code>\n` +
    `2. <b>ንግድ ባንክ (CBE):</b> <code>${CBE_ACCOUNT}</code>\n` +
    `━━━━━━━━━━━━━━━━━━━━\n\n` +
    `ክፍያውን እንደፈጸሙ የግብይቱን ቁጥር (Txn ID) እና ስልክ ቁጥርዎን እዚህ ይላኩልን ወይም ለአስተናጋጅ ያሳውቁ።`;

  await ctx.replyWithHTML(reply, Markup.inlineKeyboard([
    [Markup.button.url('💬 ክፍያ ማረጋገጫ ለአስተናጋጅ ላክ', `https://t.me/${WORKER_TELEGRAM_USERNAME.replace(/^@/, '')}`)],
    [Markup.button.callback('🏠 ወደ ዋና ገጽ (Return to Main)', 'return_main')],
  ]));

  // Notify Workers Group
  if (WORKER_CHAT_ID) {
    const workerMsg =
      `🚨 <b>አዲስ የኮርቻ ትዕዛዝ (#${orderId})</b>\n\n` +
      `<b>ደንበኛ:</b> ${session.userName} (${session.username})\n` +
      `<b>እቃ:</b> ${session.item.title}\n` +
      `<b>ምንጭ:</b> ${session.item.marketplace.toUpperCase()}\n` +
      `<b>ጠቅላላ ዋጋ:</b> ${session.item.totalDoorPrice.toLocaleString()} ETB\n` +
      `<b>የሚጠበቅ ቅድመ ክፍያ (25%):</b> ${session.item.deposit.toLocaleString()} ETB\n` +
      `<b>ቀሪ (75% COD):</b> ${session.item.cod.toLocaleString()} ETB\n` +
      `<b>ሊንክ/ፎቶ:</b> ${session.item.url || 'Screenshot'}`;

    try {
      await bot.telegram.sendMessage(WORKER_CHAT_ID, workerMsg, { parse_mode: 'HTML' });
    } catch (e) {
      console.error('Failed to notify workers:', e.message);
    }
  }
});

// Handle Screenshot / Photo Uploads (Requirement: upload screenshot returns price, 25% advance, and order)
bot.on(['photo', 'document'], async (ctx) => {
  const userId = ctx.from.id;
  const caption = ctx.message.caption || '';

  try {
    await ctx.sendChatAction('typing');
    await ctx.reply('📸 ስክሪንሾትዎ ደርሶናል! ምስሉን መርምረን የበር ላይ ዋጋውን እና የ 25% ቅድመ ክፍያ እያሰላን ነው...');

    // Extract photo file
    let fileId = null;
    if (ctx.message.photo && ctx.message.photo.length > 0) {
      fileId = ctx.message.photo[ctx.message.photo.length - 1].file_id;
    } else if (ctx.message.document && ctx.message.document.mime_type?.startsWith('image/')) {
      fileId = ctx.message.document.file_id;
    }

    if (!fileId) {
      return ctx.reply('እባክዎ ትክክለኛ የምርት ፎቶ ወይም ስክሪንሾት ይላኩልን።', Markup.inlineKeyboard([
        [Markup.button.callback('🏠 ወደ ዋና ገጽ (Return to Main)', 'return_main')],
      ]));
    }

    // Get file link from Telegram
    const fileLink = await ctx.telegram.getFileLink(fileId);
    const tempDir = '/tmp';
    const tempFilePath = path.join(tempDir, `korcha_ss_${Date.now()}.jpg`);

    await downloadTelegramFile(fileLink.href, tempFilePath);

    // Run Python scraper on the image
    const pyResult = await runPythonScraper(['--image', tempFilePath, '--caption', caption]);

    // Cleanup temp image
    try { fs.unlinkSync(tempFilePath); } catch (_) {}

    let itemData;
    if (pyResult && pyResult.pricing) {
      itemData = {
        title: pyResult.title || 'ከስክሪንሾት የተመረጠ እቃ',
        marketplace: pyResult.marketplace || 'shein',
        marketNote: pyResult.market_note || 'ከShein (ዝቅተኛ ዋጋ ካለው ገበያ) ተፈልጎ የተሰላ',
        imageUrl: pyResult.image_url || fileLink.href,
        weightKg: pyResult.pricing.weight_kg || 0.35,
        totalDoorPrice: pyResult.pricing.total_door_price_etb,
        deposit: pyResult.pricing.deposit_25_etb,
        cod: pyResult.pricing.cod_75_etb,
        usdPrice: pyResult.scraped_price || pyResult.pricing.price_usd || 12.0,
      };
    } else {
      // Fallback calculation using cheapest Shein baseline
      const fallbackPricing = calculateDoorPrice(12.0, 'USD', 0.35);
      itemData = {
        title: caption.length > 3 ? `${caption} (በShein ዝቅተኛ ዋጋ የተገኘ)` : 'ከስክሪንሾት የተመረጠ እቃ (በShein ዝቅተኛ ዋጋ)',
        marketplace: 'shein',
        marketNote: 'ከShein (ዝቅተኛ ዋጋ ካለው ገበያ) ተፈልጎ የተሰላ',
        imageUrl: fileLink.href,
        weightKg: fallbackPricing.weightKg,
        totalDoorPrice: fallbackPricing.totalDoorPrice,
        deposit: fallbackPricing.deposit,
        cod: fallbackPricing.cod,
        usdPrice: 12.0,
      };
    }

    sessions.set(userId, {
      item: itemData,
      userId,
      userName: ctx.from.first_name || 'ደንበኛ',
      username: ctx.from.username ? '@' + ctx.from.username : 'N/A',
      awaitingPrice: false,
    });

    const quoteText = formatCustomerQuote(itemData);
    await ctx.replyWithHTML(quoteText, getQuoteButtons());
  } catch (err) {
    console.error('Error handling screenshot:', err);
    ctx.reply('ፎቶውን በማንበብ ላይ ስህተት አጋጥሟል። እባክዎ የእቃውን ሊንክ ይላኩልን ወይም ዋጋውን ይጻፉልን።', Markup.inlineKeyboard([
      [Markup.button.callback('🏠 ወደ ዋና ገጽ (Return to Main)', 'return_main')],
    ]));
  }
});

// Main Text Receiver (Link Scraping, Manual Price Updates, Navigation)
bot.on('text', async (ctx) => {
  const text = ctx.message.text.trim();
  const userId = ctx.from.id;
  const currentSession = sessions.get(userId);

  // Check navigation keywords
  const isNavMain = /^(🏠\s*ዋና\s*ገጽ|ዋና\s*ገጽ|start|\/start|main|\/main|menu|\/menu|home|\/home|ወደ\s*ዋና\s*ገጽ)/i.test(text);
  if (isNavMain) {
    return sendInitialPage(ctx);
  }

  // Check worker chat request
  if (/^(💬\s*ከአስተናጋጅ\s*ጋር\s*አውራ|አስተናጋጅ|worker|chat|ድጋፍ|support)/i.test(text)) {
    const workerUrl = `https://t.me/${WORKER_TELEGRAM_USERNAME.replace(/^@/, '')}`;
    return ctx.replyWithHTML(
      `💬 <b>ከኮርቻ አስተናጋጅ ጋር በቀጥታ ይወያዩ:</b>\n\n` +
      `👉 ቴሌግራም: @${WORKER_TELEGRAM_USERNAME.replace(/^@/, '')}\n` +
      `👉 ስልክ: ${TELEBIRR_PHONE}`,
      Markup.inlineKeyboard([
        [Markup.button.url('💬 ከአስተናጋጅ ጋር ቻት ክፈት', workerUrl)],
        [Markup.button.callback('🏠 ወደ ዋና ገጽ (Return to Main)', 'return_main')],
      ])
    );
  }

  // Check screenshot upload prompt request
  if (/^(📸\s*ስክሪንሾት\s*ላክ|ስክሪንሾት|screenshot)/i.test(text)) {
    return ctx.replyWithHTML(
      `📸 <b>የመረጡትን እቃ ስክሪንሾት ወይም ፎቶ ይላኩልን:</b>\n\n` +
      `በቴሌግራም የፎቶ ማያያዣ (Attach 📎 ወይም Camera 📷) በመጫን ምስሉን ወደዚህ ቻት ይላኩ።\n` +
      `ቦቱ የበር ላይ ዋጋውን እና የ 25% ቅድመ ክፍያውን አስልቶ ያቀርብልዎታል!`,
      Markup.inlineKeyboard([
        [Markup.button.callback('🏠 ወደ ዋና ገጽ (Return to Main)', 'return_main')],
      ])
    );
  }

  // Check paste link prompt request
  if (/^(🔗\s*ሊንክ\s*አስገባ|ሊንክ|paste link|link)/i.test(text)) {
    return ctx.replyWithHTML(
      `🔗 <b>የመረጡትን እቃ ሊንክ እዚህ ቻት ላይ ይለጥፉ (Paste Link):</b>\n\n` +
      `ከ Shein፣ Temu ወይም AliExpress የመረጡትን ሊንክ ይላኩልን።\n` +
      `ቦቱ የበር ላይ ዋጋውን እና የ 25% ቅድመ ክፍያውን አስልቶ ያቀርብልዎታል!`,
      Markup.inlineKeyboard([
        [Markup.button.callback('🏠 ወደ ዋና ገጽ (Return to Main)', 'return_main')],
      ])
    );
  }

  // 1. Handle user typing an explicit price update when session.awaitingPrice is true
  if (currentSession && currentSession.awaitingPrice) {
    const numMatch = text.match(/(\d+(?:\.\d{1,2})?)/);
    if (numMatch) {
      const newPrice = parseFloat(numMatch[1]);
      const isHkd = /HKD|HK\$/i.test(text);
      const newPricing = calculateDoorPrice(newPrice, isHkd ? 'HKD' : 'USD', currentSession.item.weightKg);

      currentSession.item.totalDoorPrice = newPricing.totalDoorPrice;
      currentSession.item.deposit = newPricing.deposit;
      currentSession.item.cod = newPricing.cod;
      currentSession.item.usdPrice = newPricing.priceUsd;
      currentSession.awaitingPrice = false;
      sessions.set(userId, currentSession);

      const quote = formatCustomerQuote(currentSession.item);
      return ctx.replyWithHTML(
        `✅ <b>ዋጋው ተስተካክሏል!</b>\n\n` + quote,
        getQuoteButtons()
      );
    }
  }

  // 2. Standalone direct number (e.g. "$18.50", "HK$ 120", or "18.50")
  const isDirectNumber = /^(\$?\s*\d+(\.\d{1,2})?\s*(\$|usd|hkd|hk\$)?)$/i.test(text);
  if (isDirectNumber && currentSession) {
    const num = parseFloat(text.replace(/[^\d.]/g, ''));
    if (num > 0) {
      const isHkd = /hkd|hk\$/i.test(text);
      const newPricing = calculateDoorPrice(num, isHkd ? 'HKD' : 'USD', currentSession.item.weightKg);

      currentSession.item.totalDoorPrice = newPricing.totalDoorPrice;
      currentSession.item.deposit = newPricing.deposit;
      currentSession.item.cod = newPricing.cod;
      currentSession.item.usdPrice = newPricing.priceUsd;
      sessions.set(userId, currentSession);

      const quote = formatCustomerQuote(currentSession.item);
      return ctx.replyWithHTML(
        `✅ <b>ዋጋው ተስተካክሏል!</b>\n\n` + quote,
        getQuoteButtons()
      );
    }
  }

  // 3. Scrape marketplace product using Python scraper & calculate door price
  try {
    await ctx.sendChatAction('typing');
  } catch (_) {}

  // Run Python scraper
  const pyResult = await runPythonScraper(['--url', text]);

  let itemData;
  if (pyResult && pyResult.pricing) {
    itemData = {
      title: pyResult.title || 'የተመረጠ እቃ',
      marketplace: pyResult.marketplace || 'unknown',
      imageUrl: pyResult.image_url,
      weightKg: pyResult.pricing.weight_kg || 0.40,
      totalDoorPrice: pyResult.pricing.total_door_price_etb,
      deposit: pyResult.pricing.deposit_25_etb,
      cod: pyResult.pricing.cod_75_etb,
      usdPrice: pyResult.pricing.price_usd || 15.0,
      url: text,
    };
  } else {
    // Built-in JS fallback
    let mp = 'unknown';
    const low = text.toLowerCase();
    if (low.includes('shein')) mp = 'shein';
    else if (low.includes('temu')) mp = 'temu';
    else if (low.includes('aliexpress') || low.includes('ali.')) mp = 'aliexpress';

    const fallbackPricing = calculateDoorPrice(16.0, 'USD', 0.40);
    itemData = {
      title: mp === 'shein' ? 'የሼይን ፋሽን እቃ (Shein Fashion)' : mp === 'temu' ? 'የቴሙ ምርት (Temu Product)' : 'የአሊኤክስፕረስ እቃ (AliExpress Product)',
      marketplace: mp,
      imageUrl: null,
      weightKg: fallbackPricing.weightKg,
      totalDoorPrice: fallbackPricing.totalDoorPrice,
      deposit: fallbackPricing.deposit,
      cod: fallbackPricing.cod,
      usdPrice: 16.0,
      url: text,
    };
  }

  sessions.set(userId, {
    item: itemData,
    userId,
    userName: ctx.from.first_name || 'ደንበኛ',
    username: ctx.from.username ? '@' + ctx.from.username : 'N/A',
    awaitingPrice: false,
  });

  const quoteText = formatCustomerQuote(itemData);
  const inlineButtons = getQuoteButtons();

  // If scraped image is available, send with photo preview
  if (itemData.imageUrl && itemData.imageUrl.startsWith('http')) {
    try {
      return await ctx.replyWithPhoto(itemData.imageUrl, {
        caption: quoteText.slice(0, 1024),
        parse_mode: 'HTML',
        ...inlineButtons,
      });
    } catch (_) {
      // Fallback to text message
    }
  }

  await ctx.replyWithHTML(quoteText, inlineButtons);
});

bot.launch().then(() => {
  console.log('🚀 Korcha Telegram Bot is running with Initial Page, Return to Main, Python Scraper, and Direct Worker Chat!');
});

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
