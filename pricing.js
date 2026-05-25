/* ================================================================
   NexoSites — pricing.js
   Dynamic country-based pricing (IP geolocation, no API key needed)
   ================================================================ */

const PRICING = {
  /* Base prices in USD */
  base: { site_low: 55, site_high: 110, update: 16 },

  /* Regions: [currency code, symbol, multiplier vs USD, label] */
  regions: {
    /* South Africa */
    ZA: ['ZAR', 'R', 18.5, 'South Africa'],

    /* United Kingdom */
    GB: ['GBP', '£', 0.79, 'United Kingdom'],

    /* European Union (common countries) */
    DE: ['EUR', '€', 0.92, 'Germany'],
    FR: ['EUR', '€', 0.92, 'France'],
    NL: ['EUR', '€', 0.92, 'Netherlands'],
    BE: ['EUR', '€', 0.92, 'Belgium'],
    ES: ['EUR', '€', 0.92, 'Spain'],
    IT: ['EUR', '€', 0.92, 'Italy'],
    PT: ['EUR', '€', 0.92, 'Portugal'],
    AT: ['EUR', '€', 0.92, 'Austria'],
    IE: ['EUR', '€', 0.92, 'Ireland'],
    PL: ['EUR', '€', 0.92, 'Poland'],
    GR: ['EUR', '€', 0.92, 'Greece'],
    SE: ['SEK', 'kr', 10.4, 'Sweden'],
    NO: ['NOK', 'kr', 10.6, 'Norway'],
    DK: ['DKK', 'kr', 6.9, 'Denmark'],
    CH: ['CHF', 'CHF ', 0.9, 'Switzerland'],

    /* Canada */
    CA: ['CAD', 'CA$', 1.36, 'Canada'],

    /* Australia */
    AU: ['AUD', 'A$', 1.54, 'Australia'],

    /* New Zealand */
    NZ: ['NZD', 'NZ$', 1.67, 'New Zealand'],

    /* India */
    IN: ['INR', '₹', 83.5, 'India'],

    /* Nigeria */
    NG: ['NGN', '₦', 1580, 'Nigeria'],

    /* Kenya */
    KE: ['KES', 'KSh', 129, 'Kenya'],

    /* Ghana */
    GH: ['GHS', 'GH₵', 15.5, 'Ghana'],

    /* UAE */
    AE: ['AED', 'AED ', 3.67, 'UAE'],

    /* Singapore */
    SG: ['SGD', 'S$', 1.34, 'Singapore'],

    /* Default: USD fallback */
    _: ['USD', '$', 1, 'Worldwide'],
  },

  /**
   * Convert a USD price to a local amount, rounded sensibly.
   */
  convert(usd, multiplier) {
    const raw = usd * multiplier;
    if (raw >= 1000) return Math.round(raw / 50) * 50;   // round to 50
    if (raw >= 100)  return Math.round(raw / 5)  * 5;    // round to 5
    if (raw >= 20)   return Math.round(raw);              // round to 1
    return +raw.toFixed(2);                               // keep decimals
  },

  /**
   * Format a number for display (adds thousand separators).
   */
  fmt(n) {
    return n.toLocaleString();
  },
};

/* ── Selectors for every price element on the page ── */
const SELECTORS = {
  siteLow:  '[data-price="site-low"]',
  siteHigh: '[data-price="site-high"]',
  update:   '[data-price="update"]',
  siteRange:'[data-price="site-range"]',
  badge:    '[data-price-badge]',
  note:     '[data-price-note]',
};

function applyPricing(regionData) {
  const [currency, symbol, multiplier, country] = regionData;
  const { base, convert, fmt } = PRICING;

  const low    = convert(base.site_low,  multiplier);
  const high   = convert(base.site_high, multiplier);
  const upd    = convert(base.update,    multiplier);
  const isUSD  = currency === 'USD';

  /* Build display strings */
  const lowStr  = symbol + fmt(low);
  const highStr = symbol + fmt(high);
  const updStr  = symbol + fmt(upd);
  const rangeStr = `${lowStr} – ${highStr}`;
  const suffix  = isUSD ? '' : ` ${currency}`;

  /* Update individual price elements */
  document.querySelectorAll(SELECTORS.siteLow).forEach(el => {
    el.textContent = lowStr + suffix;
  });
  document.querySelectorAll(SELECTORS.siteHigh).forEach(el => {
    el.textContent = highStr + suffix;
  });
  document.querySelectorAll(SELECTORS.update).forEach(el => {
    el.textContent = updStr + suffix;
  });
  document.querySelectorAll(SELECTORS.siteRange).forEach(el => {
    el.textContent = rangeStr + (isUSD ? '' : ` ${currency}`);
  });

  /* Show localisation badge */
  document.querySelectorAll(SELECTORS.badge).forEach(el => {
    el.textContent = `Prices shown in ${currency} for ${country}`;
    el.style.display = 'flex';
  });

  /* Update note text on pricing page */
  document.querySelectorAll(SELECTORS.note).forEach(el => {
    if (!isUSD) {
      el.innerHTML = `<i class="fas fa-globe"></i>
        <p>Prices shown in <strong>${currency}</strong> (approximate, based on current exchange rates).
        Exact invoice will be confirmed in USD or your preferred currency via
        <a href="/pages/contact/" style="color:var(--cyan)">email or WhatsApp</a>.</p>`;
    }
  });
}

async function initDynamicPricing() {
  let countryCode = null;

  /* Try multiple free IP geolocation APIs (no key required) */
  const geoApis = [
    () => fetch('https://ipapi.co/json/', { signal: AbortSignal.timeout(3000) })
            .then(r => r.json()).then(d => d.country_code),
    () => fetch('https://ip.seeip.org/geoip', { signal: AbortSignal.timeout(3000) })
            .then(r => r.json()).then(d => d.country_code),
  ];

  for (const api of geoApis) {
    try {
      countryCode = await api();
      if (countryCode && countryCode.length === 2) break;
    } catch (_) { /* try next */ }
  }

  const regionData = PRICING.regions[countryCode] || PRICING.regions['_'];
  applyPricing(regionData);
}

/* Run after DOM is ready */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initDynamicPricing);
} else {
  initDynamicPricing();
}
