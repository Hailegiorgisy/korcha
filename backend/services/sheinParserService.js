// backend/services/sheinParserService.js
import { calculateOrderPricing } from "./pricingService.js";

export async function parseSheinProduct(rawUrl, manualUsdPrice) {
  if (!rawUrl || typeof rawUrl !== "string") {
    throw new Error("A valid Shein URL is required");
  }

  let parsedUrl;
  try {
    parsedUrl = new URL(rawUrl.trim());
  } catch {
    throw new Error("Invalid URL format");
  }

  const pathSegments = parsedUrl.pathname.split("/").filter(Boolean);
  const slug = pathSegments[pathSegments.length - 1] || "shein-item";
  const cleanSlugTitle = slug
    .replace(/-p-\d+.*$/i, "")
    .replace(/\.html?$/i, "")
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

  let productTitle = cleanSlugTitle || "Shein Fashion Product";
  let extractedUsd = manualUsdPrice ? parseFloat(manualUsdPrice) : null;
  let imageUrl = "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=600&auto=format&fit=crop&q=80";

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    const response = await fetch(parsedUrl.href, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15",
      },
    });
    clearTimeout(timeout);

    if (response.ok) {
      const html = await response.text();
      const titleMatch = html.match(/<meta\s+property=["']og:title["']\s+content=["'](.*?)["']/i);
      if (titleMatch && titleMatch[1]) {
        productTitle = titleMatch[1].replace(/\|\s*SHEIN.*$/i, "").trim();
      }

      const imgMatch = html.match(/<meta\s+property=["']og:image["']\s+content=["'](.*?)["']/i);
      if (imgMatch && imgMatch[1]) {
        imageUrl = imgMatch[1];
      }

      if (!extractedUsd) {
        const priceMatch = html.match(/<meta\s+property=["']product:price:amount["']\s+content=["'](.*?)["']/i);
        if (priceMatch && priceMatch[1]) {
          extractedUsd = parseFloat(priceMatch[1]);
        }
      }
    }
  } catch {
    // Fallback gracefully
  }

  const resolvedUsd = extractedUsd && extractedUsd > 0 ? extractedUsd : 19.99;
  const pricing = calculateOrderPricing(resolvedUsd);

  return {
    url: parsedUrl.href,
    title: productTitle,
    imageUrl,
    originalUsd: resolvedUsd,
    priceRequiredFromUser: !extractedUsd && !manualUsdPrice,
    pricing,
  };
}
