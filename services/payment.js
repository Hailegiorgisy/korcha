import axios from 'axios';
import 'dotenv/config';

const CHAPA_API_URL = 'https://api.chapa.co/v1';
const CHAPA_SECRET_KEY = process.env.CHAPA_SECRET_KEY;

export async function initializePayment({
  amountETB,
  customerName,
  customerPhone,
  customerEmail = 'customer@korcha.com.et',
  orderNumber,
  returnUrl = 'https://korcha.com.et/order-success.html'
}) {
  try {
    const names = customerName.trim().split(' ');
    const firstName = names[0] || 'Customer';
    const lastName = names.slice(1).join(' ') || 'User';

    const response = await axios.post(
      `${CHAPA_API_URL}/transaction/initialize`,
      {
        amount: amountETB.toString(),
        currency: 'ETB',
        email: customerEmail,
        first_name: firstName,
        last_name: lastName,
        phone_number: customerPhone,
        tx_ref: orderNumber,
        callback_url: `https://korcha.com.et/api/payments/webhook`,
        return_url: `${returnUrl}?order=${orderNumber}`,
        'customization[title]': 'Korcha - Shein Order',
        'customization[description]': `Payment for Order #${orderNumber}`
      },
      {
        headers: {
          Authorization: `Bearer ${CHAPA_SECRET_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.data.status === 'success') {
      return {
        success: true,
        checkoutUrl: response.data.data.checkout_url
      };
    }

    return { success: false, error: response.data.message };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || error.message
    };
  }
}

export async function verifyPayment(txRef) {
  try {
    const response = await axios.get(
      `${CHAPA_API_URL}/transaction/verify/${txRef}`,
      {
        headers: { Authorization: `Bearer ${CHAPA_SECRET_KEY}` }
      }
    );
    return response.data;
  } catch (error) {
    return { status: 'failed', error: error.message };
  }
}