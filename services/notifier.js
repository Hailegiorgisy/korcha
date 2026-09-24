import nodemailer from 'nodemailer';
import { bot } from './telegramBot.js';
import 'dotenv/config';

// 1. Email Transporter (Plesk Mail Server)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'localhost',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER || 'admin@korcha.com.et',
    pass: process.env.SMTP_PASS || 'your_email_password'
  },
  tls: { rejectUnauthorized: false }
});

/**
 * Dispatches customer messages to admin email and Telegram inbox simultaneously
 */
export async function notifyWorkers({ name, phone, email, orderNumber, message }) {
  const timestamp = new Date().toLocaleString('en-US', { timeZone: 'Africa/Addis_Ababa' });

  // ----------------------------------------------------
  // A. TELEGRAM INBOX NOTIFICATION
  // ----------------------------------------------------
  const adminChatId = process.env.TELEGRAM_ADMIN_CHAT_ID;
  if (adminChatId) {
    const tgMessage = 
`🔔 *NEW CUSTOMER INQUIRY (KORCHA)*
━━━━━━━━━━━━━━━━━━━━
👤 *Customer:* ${name}
📞 *Phone:* \`${phone}\`
${email ? `📧 *Email:* ${email}\n` : ''}${orderNumber ? `📦 *Order #:* \`${orderNumber}\`\n` : ''}
💬 *Message:*
"${message}"

🕒 *Time:* ${timestamp}`;

    try {
      await bot.telegram.sendMessage(adminChatId, tgMessage, { parse_mode: 'Markdown' });
      console.log('✅ Dispatched notification to Telegram admin inbox.');
    } catch (err) {
      console.error('❌ Failed to send Telegram alert:', err.message);
    }
  } else {
    console.warn('⚠️ TELEGRAM_ADMIN_CHAT_ID not set in .env');
  }

  // ----------------------------------------------------
  // B. EMAIL NOTIFICATION TO admin@korcha.com.et
  // ----------------------------------------------------
  const mailOptions = {
    from: `"Korcha Web Alerts" <${process.env.SMTP_USER || 'admin@korcha.com.et'}>`,
    to: 'admin@korcha.com.et',
    replyTo: email || undefined,
    subject: `[Korcha Customer Message] from ${name} (${phone})`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #0f172a; margin-top: 0;">New Customer Inquiry</h2>
        <hr style="border: 0; border-top: 1px solid #eee;">
        <p><strong>Customer Name:</strong> ${name}</p>
        <p><strong>Phone:</strong> <a href="tel:${phone}">${phone}</a></p>
        ${email ? `<p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>` : ''}
        ${orderNumber ? `<p><strong>Order Number:</strong> ${orderNumber}</p>` : ''}
        <div style="background: #f8fafc; padding: 15px; border-radius: 6px; margin-top: 15px;">
          <p style="margin: 0; font-weight: bold; color: #475569;">Customer Message:</p>
          <p style="margin: 8px 0 0 0; color: #1e293b; font-size: 15px; line-height: 1.5;">${message}</p>
        </div>
        <p style="color: #94a3b8; font-size: 12px; margin-top: 25px;">Received via Korcha Web Concierge at ${timestamp}</p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('✅ Dispatched inquiry to admin@korcha.com.et');
  } catch (err) {
    console.error('❌ Failed to send email to admin@korcha.com.et:', err.message);
  }
}