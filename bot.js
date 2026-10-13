import { Telegraf, Markup } from "telegraf";
import dotenv from "dotenv";
import { execFile } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import multer from "multer";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Environment Configuration
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const WORKER_CHAT_ID = process.env.TELEGRAM_WORKER_CHAT_ID;
const WORKER_USERNAME = (process.env.WORKER_TELEGRAM_USERNAME || "korcha_support").replace("@", "");
const HKD_EXCHANGE_RATE = parseFloat(process.env.HKD_EXCHANGE_RATE || "30.0");
const USD_TO_HKD = 7.8;
const KG_CARGO_RATE_ETB = parseFloat(process.env.KG_CARGO_RATE_ETB || "1000.0");
const TELEBIRR_PHONE = process.env.TELEBIRR_PHONE || "+251-996237800";
const CBE_ACCOUNT = process.env.CBE_ACCOUNT || "10001116390";
const WORKER_PORT = parseInt(process.env.WORKER_PORT || "3001", 10);

if (!BOT_TOKEN) {
  console.error("FATAL: TELEGRAM_BOT_TOKEN is missing in environment variables (.env).");
  process.exit(1);
}

const bot = new Telegraf(BOT_TOKEN);

// In-Memory Data Stores
const quotes = new Map(); // ticketId -> Quote object
const orders = new Map(); // orderId -> Order object
const userStates = new Map(); // userId -> { step, ticketId, phone, landmark }

// Seed sample orders for live tracking by phone or order ID
orders.set("KC-849102", {
  orderId: "KC-849102",
  phone: "+251911445566",
  userTag: "@elshaday_shein",
  itemTitle: "የሼይን ፋሽን አበባማ የበጋ ቀሚስ (Shein Floral Dress)",
  landmark: "ቦሌ መድኃኒዓለም፣ ከአትላስ ሆቴል አጠገብ",
  status: "freight_in_transit",
  depositStatus: "verified",
  totalPriceEtb: 4250,
  depositEtb: 1100,
  codEtb: 3150,
  createdAt: new Date(Date.now() - 1000 * 60 * 35),
});

orders.set("KC-592019", {
  orderId: "KC-592019",
  phone: "+251922889900",
  userTag: "@yonas_tech",
  itemTitle: "ቴሙ ዘመናዊ የብሉቱዝ ስፒከር (Temu Speaker)",
  landmark: "ካዛንቺስ፣ ከኢሊሌ ሆቴል ፊት ለፊት",
  status: "procured_in_china",
  depositStatus: "verified",
  totalPriceEtb: 7450,
  depositEtb: 1900,
  codEtb: 5550,
  createdAt: new Date(Date.now() - 1000 * 60 * 180),
});

orders.set("KC-194029", {
  orderId: "KC-194029",
  phone: "+251711223344",
  userTag: "@dawit_dev",
  itemTitle: "አሊኤክስፕረስ መካኒካል ኪቦርድ (AliExpress Keyboard)",
  landmark: "ሲኤምሲ ሚካኤል፣ ፀሐይ ሪል እስቴት መግቢያ",
  status: "pending_deposit",
  depositStatus: "pending_verification",
  totalPriceEtb: 9150,
  depositEtb: 2300,
  codEtb: 6850,
  createdAt: new Date(Date.now() - 1000 * 60 * 60 * 14),
});

// Persistent Main Reply Keyboard with "Return to Main"
const mainReplyKeyboard = Markup.keyboard([
  ["🏠 ወደ ዋና ማውጫ (Main Menu)", "🛍️ የገበያ ቦታዎች (Marketplaces)"],
  ["📦 የእኔ ትዕዛዞች (My Orders)", "💬 ከሰራተኛ ጋር ተገናኝ (Support)"],
  ["📖 መመሪያ (Help)"],
]).resize();

// Helper: Standard Welcome Message & Main Inline Keyboard (All 3 Marketplaces)
function getMainWelcomePayload(name = "ውድ ደንበኛ") {
  const welcomeText =
    `👋 ሰላም ${name}! እንኳን ወደ **ኮርቻ (Korcha)** የኢ-ኮሜርስ ቦት በደህና መጡ።\n\n` +
    `በቻይና ድረ-ገጾች ላይ የወደዱትን ማንኛውንም እቃ በቀላሉ ወደ ኢትዮጵያ በደጃፍዎ ማስመጣት ይችላሉ።\n\n` +
    `🛍️ **የገበያ ቦታዎች (Supported Marketplaces)፦**\n` +
    `1. 👗 **Shein (ሼይን)** — የሴቶችና የወንዶች ፋሽን፣ ጫማዎችና ጌጣጌጦች\n` +
    `2. 🛍️ **Temu (ቴሙ)** — የቤት እቃዎች፣ መገልገያዎችና ኤሌክትሮኒክስ\n` +
    `3. 📦 **AliExpress (አሊኤክስፕረስ)** — ልዩ ልዩ የፋብሪካ እቃዎችና ቴክኖሎጂ\n\n` +
    `📌 **እንዴት ማዘዝ ይችላሉ?**\n` +
    `• ከታች ካሉት የገበያ ቦታዎች እቃ ይምረጡ\n` +
    `• የእቃውን **ሊንክ (URL)** ወይም **ስክሪንሾት (Screenshot)** እዚህ ይላኩልን\n` +
    `• ሰራተኛችን ዋጋውን በ 5 ደቂቃ ውስጥ አስልቶ ይልክልዎታል\n` +
    `• በ 25% የቴሌብር ቅድመ ክፍያ ያዛሉ፤ ቀሪ 75% እቃው ደጃፍዎ ሲደርስ ይከፍላሉ!`;

  const inlineButtons = Markup.inlineKeyboard([
    [
      Markup.button.url("👗 Shein (ሼይን)", "https://m.shein.com"),
      Markup.button.url("🛍️ Temu (ቴሙ)", "https://www.temu.com"),
    ],
    [
      Markup.button.url("📦 AliExpress (አሊኤክስፕረስ)", "https://www.aliexpress.com"),
      Markup.button.url("💬 ሰራተኛ አናግር", `https://t.me/${WORKER_USERNAME}`),
    ],
    [
      Markup.button.callback("📦 የእኔ ትዕዛዞች (My Orders)", "menu_orders"),
      Markup.button.callback("📖 አጠቃቀም መመሪያ", "menu_help"),
    ],
    [
      Markup.button.callback("🔙 ወደ ዋና ማውጫ (Return to Main)", "return_to_main"),
    ],
  ]);

  return { text: welcomeText, keyboard: inlineButtons };
}

// WORKER CALCULATION HELPER ENGINE
function calculateDoorPrice(usdPrice, weightKg = 0.4, lengthCm = 30, widthCm = 30) {
  const usd = Math.max(0, parseFloat(usdPrice || 0));
  const weight = Math.max(0.1, parseFloat(weightKg || 0.4));
  const priceHkd = usd * USD_TO_HKD;
  const baseEtb = priceHkd * HKD_EXCHANGE_RATE;

  const supplierFee = Math.round(baseEtb * 0.27);
  const deliveryFee = Math.round(baseEtb * 0.54);
  const cargoCost = Math.round(weight * KG_CARGO_RATE_ETB);

  const totalDoorPrice = Math.round(baseEtb + supplierFee + deliveryFee + cargoCost);
  const deposit25 = Math.max(100, Math.round((totalDoorPrice * 0.25) / 100) * 100);
  const cod75 = Math.max(0, totalDoorPrice - deposit25);
  const isOversized = lengthCm > 50 || widthCm > 50;

  return {
    usd,
    weight,
    baseEtb: Math.round(baseEtb),
    supplierFee,
    deliveryFee,
    cargoCost,
    totalDoorPrice,
    deposit25,
    cod75,
    isOversized,
  };
}

// Helper: Run python scraper
function runScraper(args) {
  return new Promise((resolve) => {
    const scriptPath = path.join(__dirname, "scraper.py");
    execFile("python3", [scriptPath, ...args], (error, stdout, stderr) => {
      if (error || !stdout) {
        console.warn("Scraper warning:", stderr || error?.message);
        resolve(null);
        return;
      }
      try {
        const data = JSON.parse(stdout);
        resolve(data);
      } catch (err) {
        console.warn("JSON parse error from scraper:", err.message);
        resolve(null);
      }
    });
  });
}

// --- Worker Portal (simple web interface for workers) ---
function startWorkerPortal() {
  const app = express();
  const upload = multer({ storage: multer.memoryStorage() });

  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());

  app.get("/worker-portal", (req, res) => {
    res.send(`
      <html>
        <head><title>Korcha Worker Portal</title></head>
        <body>
          <h1>Korcha Worker Portal</h1>
          <h2>Scrape Link</h2>
          <form method="POST" action="/worker-portal/link">
            <label>Product URL: <input name="url" style="width:400px"/></label><br/>
            <button type="submit">Scrape & Estimate</button>
          </form>

          <h2>Upload Screenshot</h2>
          <form method="POST" action="/worker-portal/screenshot" enctype="multipart/form-data">
            <label>Screenshot: <input type="file" name="screenshot"/></label><br/>
            <label>Detected USD Price (optional): <input name="usd"/></label><br/>
            <label>Weight kg (optional): <input name="weight"/></label><br/>
            <button type="submit">Estimate</button>
          </form>

          <p>Note: This portal runs the same scraper and calculation helpers used by the bot.</p>
        </body>
      </html>
    `);
  });

  app.post("/worker-portal/link", async (req, res) => {
    const { url } = req.body;
    if (!url) return res.status(400).send("Missing url");

    const meta = await runScraper(["--url", url]);
    let detectedPrice = meta?.worker_helper?.detected_price || meta?.price || null;
    let suggestedWeight = meta?.worker_helper?.suggested_weight_kg || 0.4;

    // If no detected price, show results and ask worker to input USD price
    if (!detectedPrice) {
      return res.send(`
        <html><body>
          <h3>No price detected by scraper</h3>
          <p>Title: ${meta?.title || 'N/A'}</p>
          <p><img src="${meta?.image_url || ''}" style="max-width:300px"/></p>
          <form method="POST" action="/worker-portal/estimate">
            <input type="hidden" name="url" value="${url}" />
            <label>USD Price: <input name="usd"/></label><br/>
            <label>Weight kg: <input name="weight" value="${suggestedWeight}"/></label><br/>
            <button type="submit">Estimate</button>
          </form>
        </body></html>
      `);
    }

    const pricing = calculateDoorPrice(detectedPrice, suggestedWeight);
    return res.send(`
      <html><body>
        <h3>Estimation Result</h3>
        <p>Detected price: $${detectedPrice} USD</p>
        <p>Suggested weight: ${suggestedWeight} kg</p>
        <pre>
Total (ETB): ${pricing.totalDoorPrice}\nDeposit 25%: ${pricing.deposit25}\nCOD 75%: ${pricing.cod75}
        </pre>
        <p><a href="/worker-portal">Back</a></p>
      </body></html>
    `);
  });

  app.post("/worker-portal/screenshot", upload.single("screenshot"), async (req, res) => {
    const usd = req.body.usd ? parseFloat(req.body.usd) : null;
    const weight = req.body.weight ? parseFloat(req.body.weight) : 0.4;

    if (!usd) {
      return res.send(`
        <html><body>
          <h3>No USD price provided</h3>
          <form method="POST" action="/worker-portal/estimate" enctype="application/x-www-form-urlencoded">
            <label>USD Price: <input name="usd"/></label><br/>
            <label>Weight kg: <input name="weight" value="${weight}"/></label><br/>
            <input type="hidden" name="note" value="screenshot" />
            <button type="submit">Estimate</button>
          </form>
        </body></html>
      `);
    }

    const pricing = calculateDoorPrice(usd, weight);
    return res.send(`
      <html><body>
        <h3>Estimation Result</h3>
        <pre>
Total (ETB): ${pricing.totalDoorPrice}\nDeposit 25%: ${pricing.deposit25}\nCOD 75%: ${pricing.cod75}
        </pre>
        <p><a href="/worker-portal">Back</a></p>
      </body></html>
    `);
  });

  app.post("/worker-portal/estimate", async (req, res) => {
    const usd = parseFloat(req.body.usd || 0);
    const weight = parseFloat(req.body.weight || 0.4);
    if (!usd || usd <= 0) return res.status(400).send("Invalid USD price");

    const pricing = calculateDoorPrice(usd, weight);
    return res.send(`
      <html><body>
        <h3>Estimation Result</h3>
        <pre>
Total (ETB): ${pricing.totalDoorPrice}\nDeposit 25%: ${pricing.deposit25}\nCOD 75%: ${pricing.cod75}
        </pre>
        <p><a href="/worker-portal">Back</a></p>
      </body></html>
    `);
  });

  app.listen(WORKER_PORT, () => {
    console.log(`Worker portal listening on http://localhost:${WORKER_PORT}/worker-portal`);
  });
}

// 1. /start & /menu Commands
bot.command(["start", "menu"], async (ctx) => {
  const userId = ctx.from.id;
  userStates.delete(userId);

  const name = ctx.from.first_name || "ውድ ደንበኛ";
  const payload = getMainWelcomePayload(name);

  await ctx.reply("👋 እንኳን ደህና መጡ!", mainReplyKeyboard);
  return ctx.replyWithMarkdown(payload.text, payload.keyboard);
});

// 2. Action: Return to Main Menu (🔙 ወደ ዋና ማውጫ)
bot.action(["return_to_main", "menu_main"], async (ctx) => {
  const userId = ctx.from.id;
  userStates.delete(userId);

  await ctx.answerCbQuery("ወደ ዋና ማውጫ ተመልሰዋል");
  const name = ctx.from.first_name || "ውድ ደንበኛ";
  const payload = getMainWelcomePayload(name);

  try {
    await ctx.editMessageText(payload.text, {
      parse_mode: "Markdown",
      ...payload.keyboard,
    });
  } catch {
    await ctx.replyWithMarkdown(payload.text, payload.keyboard);
  }
});

// 3. Text triggers for Return to Main Menu
bot.hears([/ወደ ዋና ማውጫ/i, /main menu/i, /ተመለስ/i, /ዋና ሜኑ/i], async (ctx) => {
  const userId = ctx.from.id;
  userStates.delete(userId);

  const name = ctx.from.first_name || "ውድ ደንበኛ";
  const payload = getMainWelcomePayload(name);
  return ctx.replyWithMarkdown(payload.text, payload.keyboard);
});

// 4. Marketplaces Trigger (All three platforms)
bot.hears([/የገበያ ቦታዎች/i, /marketplaces/i, /\/marketplaces/i], async (ctx) => {
  const marketplacesText =
    `🛍️ **ቻይና የገበያ ቦታዎች**\n\n` +
    `በመረጡት ድረ-ገጽ ላይ በመግባት እቃዎችን ይመልከቱ፣ ከዚያም ሊንኩን ወይም ስክሪንሾቱን ወደዚህ ይላኩልን፦\n\n` +
    `1️⃣ **Shein (ሼይን)** — ዘመናዊ የሴቶች፣ የወንዶችና የህፃናት አልባሳት፣ ጫማና ጌጣጌጥ\n` +
    `2️⃣ **Temu (ቴሙ)** — ጥራት ያላቸው የቤትና የኩሽና እቃዎች፣ መገልገያዎችና ኤሌክትሮኒክስ\n` +
    `3️⃣ **AliExpress (አሊኤክስፕረስ)** — በጅምላና በችርቻሮ የሚቀርቡ የቴክኖሎጂ እቃዎችና እቃዎች`;

  const keyboard = Markup.inlineKeyboard([
    [
      Markup.button.url("👗 Shein (ሼይን)", "https://m.shein.com"),
      Markup.button.url("🛍️ Temu (ቴሙ)", "https://www.temu.com"),
    ],
    [
      Markup.button.url("📦 AliExpress (አሊኤክስፕረስ)", "https://www.aliexpress.com"),
    ],
    [
      Markup.button.callback("🔙 ወደ ዋና ማውጫ (Return to Main)", "return_to_main"),
    ],
  ]);

  return ctx.replyWithMarkdown(marketplacesText, keyboard);
});

// 5. /search command across all 3 marketplaces
bot.command("search", async (ctx) => {
  const query = ctx.message.text.replace("/search", "").trim();
  if (!query) {
    return ctx.replyWithMarkdown(
      `🔍 **እቃዎችን መፈለጊያ**\n\n` +
      `ለመፈለግ የሚፈልጉትን እቃ ስም ጽፈው ይላኩ።\n` +
      `ምሳሌ፦ \`/search sneaker\` ወይም \`/search dress\``
    );
  }

  const encoded = encodeURIComponent(query);
  const searchMsg =
    `🔍 **"${query}" ፍለጋ በሁሉም 3 የገበያ ቦታዎች፦**\n\n` +
    `ከታች ያሉትን ሊንኮች በመጫን በShein፣ Temu ወይም AliExpress ላይ የተገኙትን እቃዎች ይመልከቱ፦`;

  const searchButtons = Markup.inlineKeyboard([
    [Markup.button.url(`👗 Shein ላይ "${query}" ፈልግ`, `https://m.shein.com/us/search/${encoded}.html`)],
    [Markup.button.url(`🛍️ Temu ላይ "${query}" ፈልግ`, `https://www.temu.com/search_result.html?search_key=${encoded}`)],
    [Markup.button.url(`📦 AliExpress ላይ "${query}" ፈልግ`, `https://www.aliexpress.com/wholesale?SearchText=${encoded}`)],
    [Markup.button.callback("🔙 ወደ ዋና ማውጫ (Return to Main)", "return_to_main")],
  ]);

  return ctx.replyWithMarkdown(searchMsg, searchButtons);
});

// 6. WORKER CALCULATION HELPER COMMAND: /calc <usdPrice> [weightKg]
bot.command("calc", async (ctx) => {
  const parts = ctx.message.text.trim().split(/\s+/);
  if (parts.length < 2) {
    return ctx.replyWithMarkdown(
      `🧮 **የሰራተኛ ዋጋ ማስያ ረዳት (Worker Calculation Helper)**\n\n` +
      `አጠቃቀም፦ \`/calc <USD_PRICE> [WEIGHT_KG]\`\n\n` +
      `ምሳሌ፦ \`/calc 14.50 0.35\` ወይም \`/calc 25\``
    );
  }

  const usd = parseFloat(parts[1]);
  const weight = parseFloat(parts[2] || "0.40");

  if (isNaN(usd) || usd <= 0) {
    return ctx.reply("❌ እባክዎን ትክክለኛ የዶላር ዋጋ (USD Price) ያስገቡ።");
  }

  const calc = calculateDoorPrice(usd, weight);
  const reply =
    `🧮 **የዋጋ ስሌት ረዳት ውጤት (Calculation Breakdown)**\n\n` +
    `💵 **የእቃ ዋጋ፦** $${calc.usd.toFixed(2)} USD (~${calc.baseEtb.toLocaleString()} ETB)\n` +
    `📦 **ክብደት፦** ${calc.weight.toFixed(2)} kg (ጭነት፦ ${calc.cargoCost.toLocaleString()} ETB)\n` +
    `🏢 **የአቅራቢ ወጪ (+27%)፦** ${calc.supplierFee.toLocaleString()} ETB\n` +
    `🚚 **የማድረሻ አገልግሎት (+54%)፦** ${calc.deliveryFee.toLocaleString()} ETB\n` +
    `━━━━━━━━━━━━━━━━━━━\n` +
    `💰 **ጠቅላላ የደጃፍ ዋጋ፦** **${calc.totalDoorPrice.toLocaleString()} ብር**\n` +
    `💳 **25% ቅድመ ክፍያ፦** **${calc.deposit25.toLocaleString()} ብር**\n` +
    `🚚 **75% ቀሪ ክፍያ (COD)፦** **${calc.cod75.toLocaleString()} ብር**`;

  return ctx.replyWithMarkdown(reply);
});

// 6b. /orders, /track, /myorders commands and live tracking
async function handleTrackingResponse(ctx, rawQuery = "") {
  const query = rawQuery.trim().replace(/\D/g, "");
  const textQuery = rawQuery.trim().toLowerCase();

  // Find matching order by phone or order ID
  let matched = [];
  if (query.length >= 4 || textQuery.length >= 3) {
    for (const [id, ord] of orders.entries()) {
      const cleanPhone = (ord.phone || "").replace(/\D/g, "");
      const cleanId = (ord.orderId || id).toLowerCase();
      if ((query.length >= 4 && cleanPhone.includes(query)) || cleanId.includes(textQuery)) {
        matched.push(ord);
      }
    }
  }

  if (matched.length === 0) {
    return ctx.replyWithMarkdown(
      `📦 **የእኔ ትዕዛዞችና የቀጥታ ክትትል (My Orders & Live Tracking)**\n\n` +
      `ያዘዟቸውን እቃዎች፣ የ 25% ቅድመ ክፍያ ማረጋገጫ እና ከቻይና እስከ ደጃፍዎ ያለውን የቀጥታ የጉዞ ሁኔታ ለመከታተል **ስልክ ቁጥርዎን** ወይም **የትዕዛዝ ቁጥርዎን** ይላኩልን።\n\n` +
      `💡 *ምሳሌ፦ \`/track 0911445566\` ወይም \`/track KC-849102\` ወይም በቀጥታ ስልክዎን እዚህ ቻት ላይ ይጻፉ።*`,
      Markup.inlineKeyboard([
        [
          Markup.button.callback("🔍 በናሙና ስልክ ሞክር (0911445566)", "track_demo_0911"),
        ],
        [
          Markup.button.url("💬 ከአስተናጋጅ ጋር አውራ", `https://t.me/${WORKER_USERNAME}`),
          Markup.button.callback("🔙 ወደ ዋና ማውጫ", "return_to_main"),
        ],
      ])
    );
  }

  // Display found orders
  for (const ord of matched.slice(0, 3)) {
    const statusMap = {
      pending_deposit: "1/7 ⏳ የ 25% ቅድመ ክፍያ ማረጋገጫ በመጠባበቅ ላይ",
      deposit_verified: "2/7 ✅ ክፍያ ተረጋግጧል፤ ወደ ግዢ ክፍል ተላልፏል",
      procured_in_china: "3/7 🛍️ ከቻይና ተገዝቷል (ጓንግዡ መጋዘን ገብቷል)",
      freight_in_transit: "4/7 ✈️ በአየር ጭነት በረራ ላይ ወደ አዲስ አበባ",
      customs_clearing: "5/7 🛃 ቦሌ ጉምሩክ ክሊራንስ በመከናወን ላይ",
      out_for_delivery: "6/7 🚚 ወደ ደጃፍዎ በመጓዝ ላይ",
      delivered: "7/7 🏠 ደጃፍዎ ደርሷል (ቀሪ 75% ተጠናቋል)",
    };

    const statusText = statusMap[ord.status] || "📦 በሂደት ላይ";
    const depositBadge = ord.depositStatus === "verified" ? "✅ ተረጋግጧል (Verified)" : "⏳ ማረጋገጫ በመጠበቅ ላይ (Pending)";

    const msg =
      `📦 **የትዕዛዝ መረጃ፦** \`#${ord.orderId}\`\n\n` +
      `🛍️ **እቃ፦** ${ord.itemTitle || ord.itemUrl || "የኮርቻ እቃ"}\n` +
      `📍 **የማድረሻ አድራሻ፦** ${ord.landmark || "አዲስ አበባ"}\n` +
      `📞 **ስልክ፦** \`${ord.phone}\`\n\n` +
      `🚀 **የቀጥታ ጉዞ ሁኔታ፦**\n` +
      `👉 **${statusText}**\n\n` +
      `💰 **የዋጋ ዝርዝር፦**\n` +
      `• ጠቅላላ ዋጋ፦ ${ord.totalPriceEtb ? ord.totalPriceEtb.toLocaleString() : (ord.pricing?.totalDoorPrice?.toLocaleString() || "")} ETB\n` +
      `• 25% ቅድመ ክፍያ፦ ${ord.depositEtb ? ord.depositEtb.toLocaleString() : (ord.pricing?.deposit25?.toLocaleString() || "")} ETB (${depositBadge})\n` +
      `• 75% በር ላይ፦ ${ord.codEtb ? ord.codEtb.toLocaleString() : (ord.pricing?.cod75?.toLocaleString() || "")} ETB\n\n` +
      `✈️ የማድረሻ ጊዜ፦ ከ 10 እስከ 14 የስራ ቀናት`;

    const kb = Markup.inlineKeyboard([
      [Markup.button.url("💬 ስለ እቃው አስተናጋጅ ጠይቅ", `https://t.me/${WORKER_USERNAME}`)],
      [Markup.button.callback("🔙 ወደ ዋና ማውጫ", "return_to_main")],
    ]);

    await ctx.replyWithMarkdown(msg, kb);
  }
}

bot.command(["orders", "myorders", "track"], async (ctx) => {
  const parts = ctx.message.text.trim().split(/\s+/);
  const q = parts.slice(1).join(" ");
  return handleTrackingResponse(ctx, q);
});

bot.action("menu_orders", async (ctx) => {
  await ctx.answerCbQuery();
  return handleTrackingResponse(ctx, "");
});

bot.action("track_demo_0911", async (ctx) => {
  await ctx.answerCbQuery();
  return handleTrackingResponse(ctx, "0911445566");
});

bot.hears([/የእኔ ትዕዛዞች/i, /ትዕዛዞቼ/i, /ክትትል/i, /^track/i], async (ctx) => {
  const text = ctx.message.text.replace(/የእኔ ትዕዛዞች|ትዕዛዞቼ|ክትትል|track/gi, "").trim();
  return handleTrackingResponse(ctx, text);
});

// 7. Handling incoming links (Shein, Temu, AliExpress)
bot.hears(/(https?:\/\/[^\s]+)/g, async (ctx) => {
  const url = ctx.message.text.trim();
  const userId = ctx.from.id;
  const userTag = ctx.from.username ? `@${ctx.from.username}` : (ctx.from.first_name || `User ${userId}`);
  const ticketId = `KORCHA-${Date.now().toString().slice(-6)}`;

  const waitMsg = await ctx.reply("🔍 የእቃውን መረጃ በመቀበል ላይ... እባክዎ ትንሽ ይጠብቁ...");

  // Run scraper helper: Extracts title, image, and candidate price suggestion
  const meta = await runScraper(["--url", url]);
  const title = meta?.title || "የተመረጠ እቃ (Selected Product)";
  const imageUrl = meta?.image_url || null;
  const marketplace = meta?.marketplace || "Marketplace";
  const helper = meta?.worker_helper || null;

  quotes.set(ticketId, {
    ticketId,
    userId,
    userTag,
    url,
    title,
    imageUrl,
    marketplace,
    workerHelper: helper,
    status: "pending_worker_estimation",
    createdAt: new Date(),
  });

  try {
    await ctx.deleteMessage(waitMsg.message_id);
  } catch {}

  // Customer Response: Strictly NO automatic price sent to customer
  const customerReply =
    `🛍️ **የእቃው መረጃ ደርሶናል!**\n\n` +
    `📦 **እቃ፦** ${title}\n` +
    `🌐 **ገበያ፦** ${marketplace.toUpperCase()}\n` +
    `🎫 **የጥያቄ ቲኬት፦** \`#${ticketId}\`\n\n` +
    `ሰራተኛችን የደጃፍ ዋጋ አስልቶ በአምስት ደቂቃ ያሳውቅዎታል።`;

  const customerKeyboard = Markup.inlineKeyboard([
    [Markup.button.url("💬 ከሰራተኛው ጋር ይገናኙ (Talk to Worker)", `https://t.me/${WORKER_USERNAME}?start=quote_${ticketId}`)],
    [Markup.button.callback("🔙 ወደ ዋና ማውጫ (Return to Main)", "return_to_main")],
  ]);

  if (imageUrl) {
    try {
      await ctx.replyWithPhoto(imageUrl, {
        caption: customerReply,
        parse_mode: "Markdown",
        ...customerKeyboard,
      });
    } catch {
      await ctx.replyWithMarkdown(customerReply, customerKeyboard);
    }
  } else {
    await ctx.replyWithMarkdown(customerReply, customerKeyboard);
  }

  // DISPATCH ALERT TO WORKER CHANNEL WITH SCRAPING & CALCULATION HELPER
  if (WORKER_CHAT_ID) {
    let workerHelperSnippet = "";
    let workerButtons = [];

    if (helper && helper.detected_price && helper.precalculated_door_price) {
      const p = helper.precalculated_door_price;
      workerHelperSnippet =
        `🛠️ **የሰራተኛ ረዳት ስሌት (Worker Helper Suggestion)፦**\n` +
        `• የተገኘ ዋጋ፦ **$${helper.detected_price} USD**\n` +
        `• የተገመተ ክብደት፦ **${helper.suggested_weight_kg} kg**\n` +
        `• የሚመከር ዋጋ፦ **${p.total_door_price_etb.toLocaleString()} ETB** (ቅድመ ክፍያ: ${p.deposit_25_etb.toLocaleString()} ETB)\n\n` +
        `*(ሰራተኛው ይህንን ዋጋ 1-Click በማጽደቅ ወይም የራሱን ዋጋ በመስጠት ማስተካከል ይችላል)*\n`;

      workerButtons.push([
        Markup.button.callback(
          `✅ በ $${helper.detected_price} አጽድቅ (${p.total_door_price_etb.toLocaleString()} ETB)`,
          `approve_helper_${ticketId}_${helper.detected_price}_${helper.suggested_weight_kg}`
        ),
      ]);
    } else {
      workerHelperSnippet =
        `⚠️ **ረዳት ማስታወሻ፦** የቀጥታ ዋጋ በራስ-ሰር ማግኘት አልተቻለም (Anti-bot)። እባክዎ ሊንኩን ከፍተው ዋጋውን ይመል`;
    }

    workerButtons.push([
      Markup.button.url("🔗 እቃውን በድረ-ገጹ ላይ ክፈት", url),
    ]);

    const workerAlert =
      `🔔 **አዲስ የዋጋ ስሌት ጥያቄ (New Quote Request)**\n\n` +
      `🎫 **Ticket:** \`#${ticketId}\`\n` +
      `👤 **ደንበኛ:** ${userTag} (ID: \`${userId}\`)\n` +
      `🌐 **ገበያ:** ${marketplace.toUpperCase()}\n` +
      `📦 **እቃ:** ${title}\n` +
      `🔗 **ሊንክ:** ${url}\n\n` +
      workerHelperSnippet +
      `👉 **ዋጋ በእጅ ለመስጠት፦**\n` +
      `\`/estimate ${ticketId} <USD_PRICE> [WEIGHT_KG]\`\n\n` +
      `👉 **ፈጣን ስሌት ረዳት ለመጠቀም፦** \`/calc <USD_PRICE> [WEIGHT_KG]\``;

    try {
      await ctx.telegram.sendMessage(WORKER_CHAT_ID, workerAlert, {
        parse_mode: "Markdown",
        ...Markup.inlineKeyboard(workerButtons),
      });
    } catch (err) {
      console.warn("Failed to alert worker channel:", err.message);
    }
  }
});

// 8. Handling uploaded photos / screenshots with Worker Helper
bot.on("photo", async (ctx) => {
  const userId = ctx.from.id;
  const userTag = ctx.from.username ? `@${ctx.from.username}` : (ctx.from.first_name || `User ${userId}`);
  const ticketId = `KORCHA-${Date.now().toString().slice(-6)}`;
  const caption = ctx.message.caption || "የእቃ ፎቶ/ስክሪንሾት";
  const photo = ctx.message.photo[ctx.message.photo.length - 1];

  quotes.set(ticketId, {
    ticketId,
    userId,
    userTag,
    caption,
    fileId: photo.file_id,
    status: "pending_worker_estimation",
    createdAt: new Date(),
  });

  const customerReply =
    `📸 **ስክሪንሾቱ ደርሶናል!**\n\n` +
    `📝 **መግለጫ፦** ${caption}\n` +
    `🎫 **የጥያቄ ቲኬት፦** \`#${ticketId}\`\n\n` +
    `ሰራተኛችን የደጃፍ ዋጋ አስልቶ በአምስት ደቂቃ ያሳውቅዎታል።`;

  await ctx.replyWithMarkdown(
    customerReply,
    Markup.inlineKeyboard([
      [Markup.button.url("💬 ከሰራተኛው ጋር ይገናኙ", `https://t.me/${WORKER_USERNAME}?start=quote_${ticketId}`)],
      [Markup.button.callback("🔙 ወደ ዋና ማውጫ (Return to Main)", "return_to_main")],
    ])
  );

  if (WORKER_CHAT_ID) {
    const workerCaption =
      `📸 **አዲስ የስክሪንሾት ዋጋ ጥያቄ (New Screenshot Quote)**\n\n` +
      `🎫 **Ticket:** \`#${ticketId}\`\n` +
      `👤 **ደንበኛ:** ${userTag} (ID: \`${userId}\`)\n` +
      `📝 **ማስታወሻ:** ${caption}\n\n` +
      `🛠️ **ስሌት ረዳት፦** \`/calc <USD_PRICE> [WEIGHT_KG]\`\n` +
      `👉 **ዋጋ ለመስጠት፦** \`/estimate ${ticketId} <USD_PRICE> [WEIGHT_KG]\``;

    try {
      await ctx.telegram.sendPhoto(WORKER_CHAT_ID, photo.file_id, {
        caption: workerCaption,
        parse_mode: "Markdown",
      });
    } catch (err) {
      console.warn("Failed to forward photo to worker channel:", err.message);
    }
  }
});

// 9. Worker 1-Click Approval Action (Helper Button: approve_helper_<ticket>_<usd>_<weight>)
bot.action(/approve_helper_(.+)_([0-9\.]+)_([0-9\.]+)/, async (ctx) => {
  const ticketId = ctx.match[1];
  const usdPrice = parseFloat(ctx.match[2]);
  const weightKg = parseFloat(ctx.match[3]);

  const quote = quotes.get(ticketId);
  if (!quote) {
    return ctx.answerCbQuery("❌ ቲኬት ቁጥሩ አልተገኘም");
  }

  const pricing = calculateDoorPrice(usdPrice, weightKg);
  quote.pricing = pricing;
  quote.status = "estimated";

  await ctx.answerCbQuery("✓ ዋጋው ጸድቆ ለደንበኛው ተልኳል");
  await ctx.replyWithMarkdown(
    `✅ **ዋጋው በረዳት ስሌት መሰረት ጸድቋል!**\n\n` +
    `🎫 **Ticket:** \`#${ticketId}\`\n` +
    `💵 **Total:** ${pricing.totalDoorPrice.toLocaleString()} ETB\n` +
    `💳 **Deposit (25%):** ${pricing.deposit25.toLocaleString()} ETB\n` +
    `🚚 **COD (75%):** ${pricing.cod75.toLocaleString()} ETB`
  );

  // Send to customer
  const customerQuoteMsg =
    `✨ **የዋጋ ስሌት ደርሶዎታል! (Your Price Quote is Ready)**\n\n` +
    `🎫 **የጥያቄ ቲኬት፦** \`#${ticketId}\`\n` +
    `📦 **እቃ፦** ${quote.title || quote.caption || "የተመረጠ እቃ"}\n\n` +
    `💰 **ጠቅላላ የደጃፍ ዋጋ (Total Landed Cost)፦** **${pricing.totalDoorPrice.toLocaleString()} ብር**\n` +
    `💳 **የ 25% ቅድመ ክፍያ (Advance Deposit)፦** **${pricing.deposit25.toLocaleString()} ብር**\n` +
    `🚚 **ቀሪ 75% ሲደርስ የሚከፈል (COD)፦** **${pricing.cod75.toLocaleString()} ብር**\n\n` +
    `📦 ዋጋው የውጭ ሀገር ግዢ፣ የጉዞ ጭነት፣ የጉምሩክ እና የደጃፍ ማድረሻ አገልግሎትን ያካተተ ነው።\n\n` +
    `ትዕዛዝዎን ለማጠናቀቅ ከታች ያለውን **"🛒 አሁን እዘዝ"** የሚለውን ይጫኑ👇`;

  const orderKeyboard = Markup.inlineKeyboard([
    [Markup.button.callback("🛒 አሁን እዘዝ (Place Order Now)", `order_${ticketId}`)],
    [Markup.button.url("💬 ጥያቄ ካለዎት ሰራተኛ አናግሩ", `https://t.me/${WORKER_USERNAME}`)],
    [Markup.button.callback("🔙 ወደ ዋና ማውጫ (Return to Main)", "return_to_main")],
  ]);

  try {
    await ctx.telegram.sendMessage(quote.userId, customerQuoteMsg, {
      parse_mode: "Markdown",
      ...orderKeyboard,
    });
  } catch (err) {
    await ctx.reply(`⚠️ ደንበኛውን ማግኘት አልተቻለም (ID: ${quote.userId})፦ ${err.message}`);
  }
});

// 10. Worker Command: /estimate <ticketId> <usdPrice> [weightKg]
bot.command(["estimate", "quote"], async (ctx) => {
  const parts = ctx.message.text.trim().split(/\s+/);
  if (parts.length < 3) {
    return ctx.replyWithMarkdown(
      `⚠️ **ትክክለኛ አጠቃቀም፦**\n\`/estimate <TICKET_ID> <USD_PRICE> [WEIGHT_KG]\`\n\n` +
      `ምሳሌ፦ \`/estimate KORCHA-123456 18.5 0.4\``
    );
  }

  const rawTicket = parts[1].replace("#", "").trim();
  const usdPrice = parseFloat(parts[2]);
  const weightKg = parseFloat(parts[3] || "0.4");

  if (isNaN(usdPrice) || usdPrice <= 0) {
    return ctx.reply("❌ እባክዎን ትክክለኛ የዶላር ዋጋ (USD Price) ያስገቡ።");
  }

  const quote = quotes.get(rawTicket);
  if (!quote) {
    return ctx.reply(`❌ ቲኬት ቁጥር #${rawTicket} አልተገኘም። እባክዎ ቁጥሩን ያረጋግጡ።`);
  }

  const pricing = calculateDoorPrice(usdPrice, weightKg);
  quote.pricing = pricing;
  quote.status = "estimated";

  await ctx.replyWithMarkdown(
    `✅ **ዋጋው በተሳካ ሁኔታ ተሰልቶ ለደንበኛው ተልኳል!**\n\n` +
    `🎫 **Ticket:** \`#${rawTicket}\`\n` +
    `💵 **Total:** ${pricing.totalDoorPrice.toLocaleString()} ETB\n` +
    `💳 **Deposit (25%):** ${pricing.deposit25.toLocaleString()} ETB\n` +
    `🚚 **COD (75%):** ${pricing.cod75.toLocaleString()} ETB`
  );

  const customerQuoteMsg =
    `✨ **የዋጋ ስሌት ደርሶዎታል! (Your Price Quote is Ready)**\n\n` +
    `🎫 **የጥያቄ ቲኬት፦** \`#${rawTicket}\`\n` +
    `📦 **እቃ፦** ${quote.title || quote.caption || "የተመረጠ እቃ"}\n\n` +
    `💰 **ጠቅላላ የደጃፍ ዋጋ (Total Landed Cost)፦** **${pricing.totalDoorPrice.toLocaleString()} ብር**\n` +
    `💳 **የ 25% ቅድመ ክፍያ (Advance Deposit)፦** **${pricing.deposit25.toLocaleString()} ብር**\n` +
    `🚚 **ቀሪ 75% ሲደርስ የሚከፈል (COD)፦** **${pricing.cod75.toLocaleString()} ብር**\n\n` +
    `📦 ዋጋው የውጭ ሀገር ግዢ፣ የጉዞ ጭነት፣ የጉምሩክ እና የደጃፍ ማድረሻ አገልግሎትን ያካተተ ነው።\n\n` +
    `ትዕዛዝዎን ለማጠናቀቅ ከታች ያለውን **"🛒 አሁን እዘዝ"** የሚለውን ይጫኑ👇`;

  const orderKeyboard = Markup.inlineKeyboard([
    [Markup.button.callback("🛒 አሁን እዘዝ (Place Order Now)", `order_${rawTicket}`)],
    [Markup.button.url("💬 ጥያቄ ካለዎት ሰራተኛ አናግሩ", `https://t.me/${WORKER_USERNAME}`)],
    [Markup.button.callback("🔙 ወደ ዋና ማውጫ (Return to Main)", "return_to_main")],
  ]);

  try {
    await ctx.telegram.sendMessage(quote.userId, customerQuoteMsg, {
      parse_mode: "Markdown",
      ...orderKeyboard,
    });
  } catch (err) {
    await ctx.reply(`⚠️ ደንበኛውን ማግኘት አልተቻለም (ID: ${quote.userId})፦ ${err.message}`);
  }
});

// 11. Callback Query: "Order Now" button
bot.action(/order_(.+)/, async (ctx) => {
  const ticketId = ctx.match[1];
  const quote = quotes.get(ticketId);
  const userId = ctx.from.id;

  if (!quote || !quote.pricing) {
    return ctx.reply("❌ የዋጋ ስሌት መረጃው አልተገኘም። እባክዎ እንደገና ይሞክሩ ወይም ሰራተኛ ያነጋግሩ።");
  }

  userStates.set(userId, {
    step: "AWAITING_PHONE",
    ticketId,
  });

  await ctx.answerCbQuery();
  return ctx.replyWithMarkdown(
    `📦 **ትዕዛዝ ማረጋገጫ (Step 1/2)**\n\n` +
    `የመረጡት እቃ፦ **${quote.title || quote.caption}**\n` +
    `የ 25% ቅድመ ክፍያ፦ **${quote.pricing.deposit25.toLocaleString()} ብር**\n\n` +
    `እባክዎን **ስልክ ቁጥርዎን** ያስገቡ፦\n*(ምሳሌ፦ 0911234567)*`,
    Markup.inlineKeyboard([
      [Markup.button.callback("🔙 ትዕዛዙን ሰርዝና ወደ ዋና ማውጫ ተመለስ", "return_to_main")],
    ])
  );
});

// 12. Text Handler for Order Checkout Steps (Phone & Landmark)
bot.on("text", async (ctx, next) => {
  const userId = ctx.from.id;
  const state = userStates.get(userId);

  if (!state) {
    return next();
  }

  const text = ctx.message.text.trim();

  if (/^(ተመለስ|ሰርዝ|cancel|back|main menu|ወደ ዋና ማውጫ)$/i.test(text)) {
    userStates.delete(userId);
    const payload = getMainWelcomePayload(ctx.from.first_name);
    return ctx.replyWithMarkdown("❌ ትዕዛዝዎ ተሰርዟል፤ ወደ ዋና ማውጫ ተመልሰዋል።\n\n" + payload.text, payload.keyboard);
  }

  if (state.step === "AWAITING_PHONE") {
    const cleanPhone = text.replace(/[\s-]/g, "");
    if (!/^(?:\+251|0)?9\d{8}$/.test(cleanPhone)) {
      return ctx.replyWithMarkdown(
        "⚠️ እባክዎን ትክክለኛ የኢትዮጵያ ስልክ ቁጥር ያስገቡ (ምሳሌ፦ `0911234567` ወይም `+251911234567`)።\n\n" +
        "ለመሰረዝ ከፈለጉ 'ተመለስ' ብለው ይጻፉ።"
      );
    }

    state.phone = cleanPhone;
    state.step = "AWAITING_LANDMARK";
    userStates.set(userId, state);

    return ctx.replyWithMarkdown(
      `📍 **የመዳረሻ አድራሻ (Step 2/2)**\n\n` +
      `እባክዎን **የመዳረሻ ምልክት (Landmark) ወይም ክፍለ ከተማ** ይጻፉ፦\n` +
      `*(ምሳሌ፦ ቦሌ መድኃኔዓለም ወይም መገናኛ ማራቶን ህንጻ አጠገብ)*`,
      Markup.inlineKeyboard([
        [Markup.button.callback("🔙 ሰርዝና ወደ ዋና ማውጫ ተመለስ", "return_to_main")],
      ])
    );
  }

  if (state.step === "AWAITING_LANDMARK") {
    state.landmark = text;
    const ticket = quotes.get(state.ticketId);
    const orderId = `ORD-${Date.now().toString().slice(-6)}`;

    const orderData = {
      orderId,
      ticketId: state.ticketId,
      userId,
      userTag: ctx.from.username ? `@${ctx.from.username}` : (ctx.from.first_name || `User ${userId}`),
      phone: state.phone,
      landmark: state.landmark,
      itemTitle: ticket?.title || ticket?.caption || "Marketplace Item",
      itemUrl: ticket?.url || "Screenshot",
      pricing: ticket?.pricing,
      status: "awaiting_deposit",
      createdAt: new Date(),
    };

    orders.set(orderId, orderData);
    userStates.delete(userId);

    const paymentMsg =
      `🎉 **ትዕዛዝዎ በተሳካ ሁኔታ ተመዝግቧል!**\n\n` +
      `📦 **የትዕዛዝ ቁጥር፦** \`#${orderId}\`\n` +
      `💵 **ጠቅላላ ዋጋ፦** ${ticket.pricing.totalDoorPrice.toLocaleString()} ብር\n` +
      `💳 **መከፈል ያለበት 25% ቅድመ ክፍያ፦** **${ticket.pricing.deposit25.toLocaleString()} ብር**\n` +
      `🚚 **ቀሪ 75% ሲደርስ የሚከፈል፦** ${ticket.pricing.cod75.toLocaleString()} ብር\n\n` +
      `━━━━━━━━━━━━━━━━━━━\n` +
      `📲 **የቅድመ ክፍያ መመሪያ (Payment Steps)፦**\n\n` +
      `1️⃣ **በቴሌብር (Telebirr)፦**\n` +
      `   ስልክ፦ \`${TELEBIRR_PHONE}\`\n` +
      `   ስም፦ Korcha Marketplace\n\n` +
      `2️⃣ **በንግድ ባንክ (CBE)፦**\n` +
      `   ሒሳብ ቁጥር፦ \`${CBE_ACCOUNT}\`\n` +
      `   ስም፦ Korcha Cross-Border\n\n` +
      `━━━━━━━━━━━━━━━━━━━\n` +
      `⚠️ **ክፍያውን እንደፈጸሙ የግብይት ቁጥሩን (Transaction ID) ወይም ደረሰኝ እዚህ ይላኩልን!**`;

    const finishKeyboard = Markup.inlineKeyboard([
      [Markup.button.url("💬 ደረሰኝ ለሰራተኛው ይላኩ", `https://t.me/${WORKER_USERNAME}`)],
      [Markup.button.callback("🔙 ወደ ዋና ማውጫ (Return to Main)", "return_to_main")],
    ]);

    await ctx.replyWithMarkdown(paymentMsg, finishKeyboard);

    if (WORKER_CHAT_ID) {
      const workerOrderAlert =
        `🚨 **አዲስ የተረጋገጠ ትዕዛዝ (New Confirmed Order)!**\n\n` +
        `📦 **Order ID:** \`#${orderId}\`\n` +
        `🎫 **Ticket:** \`#${state.ticketId}\`\n` +
        `👤 **ደንበኛ:** ${orderData.userTag} (ID: \`${userId}\`)\n` +
        `📞 **ስልክ:** \`${orderData.phone}\`\n` +
        `📍 **አድራሻ:** ${orderData.landmark}\n\n` +
        `💰 **ጠቅላላ ዋጋ:** ${ticket.pricing.totalDoorPrice.toLocaleString()} ETB\n` +
        `💳 **ቅድመ ክፍያ (25%):** ${ticket.pricing.deposit25.toLocaleString()} ETB\n` +
        `🚚 **ቀሪ ክፍያ (75%):** ${ticket.pricing.cod75.toLocaleString()} ETB\n` +
        `🔗 **እቃ:** ${orderData.itemUrl}\n\n` +
        `📌 **ሁኔታ:** የቴሌብር/CBE ክፍያ ደረሰኝ በመጠበቅ ላይ...`;

      try {
        await ctx.telegram.sendMessage(WORKER_CHAT_ID, workerOrderAlert, { parse_mode: "Markdown" });
      } catch (err) {
        console.warn("Failed to notify worker channel of order:", err.message);
      }
    }
  }
});

// Launch worker portal
startWorkerPortal();

// Launch bot
bot.launch().then(() => {
  console.log("🚀 Korcha Telegram Bot is running in Worker-Assisted Mode...");
}).catch((err) => {
  console.error("Bot launch failed:", err.message);
});

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
