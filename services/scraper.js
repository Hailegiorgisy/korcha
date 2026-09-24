import axios from 'axios';
import * as cheerio from 'cheerio';

export async function parseProductUrl(rawUrl) {
  try {
    const url = rawUrl.trim();
    const cleanUrl = url.split('?')[0];

    const response = await axios.get(cleanUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      },
      timeout: 15000
    });

    const $ = cheerio.load(response.data);

    let title = $('meta[property="og:title"]').attr('content') || $('title').text().trim();
    let image = $('meta[property="og:image"]').attr('content') || '';
    let price = $('meta[property="product:price:amount"]').attr('content');

    if (!price) {
      $('script[type="application/ld+json"]').each((_, elem) => {
        try {
          const json = JSON.parse($(elem).html());
          if (json['@type'] === 'Product' || json.offers) {
            if (json.name && !title) title = json.name;
            if (json.image && !image) image = Array.isArray(json.image) ? json.image[0] : json.image;
            if (json.offers) {
              const offer = Array.isArray(json.offers) ? json.offers[0] : json.offers;
              price = offer.price || offer.lowPrice;
            }
          }
        } catch (_) {}
      });
    }

    title = title.replace(/\s*\|\s*SHEIN.*/i, '').trim();
    if (image.startsWith('//')) image = 'https:' + image;

    const usdPrice = parseFloat(price) || 0;

    if (usdPrice <= 0) {
      return {
        success: false,
        error: 'Unable to automatically detect the price from this link. Please check the URL.'
      };
    }

    return {
      success: true,
      originalUrl: url,
      title,
      imageUrl: image,
      usdPrice
    };
  } catch (err) {
    return {
      success: false,
      error: `Failed to fetch product details: ${err.message}`
    };
  }
}