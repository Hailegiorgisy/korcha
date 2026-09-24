import { bot } from './services/telegramBot.js';

console.log('🤖 Starting Korcha Telegram Bot in Polling Mode...');

bot.launch()
  .then(() => {
    console.log('✅ Korcha Telegram Bot is online and listening for messages!');
  })
  .catch((err) => {
    console.error('❌ Failed to launch bot:', err);
  });

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));