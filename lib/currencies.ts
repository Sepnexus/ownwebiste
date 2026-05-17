/**
 * Currencies Razorpay supports for international payments / subscription plans.
 *
 * `decimals` is the number of minor-unit places — it drives the conversion
 * from the major-unit price the admin types (e.g. 99) into the smallest unit
 * Razorpay's API expects:
 *   - 2 → cents/paise          99   → 9900   (most currencies)
 *   - 0 → no minor unit        1000 → 1000   (JPY, KRW, …)
 *   - 3 → millimes             50   → 50000  (KWD, BHD, OMR, …)
 *
 * `COMMON` currencies are pinned to the top of the picker; everything else is
 * listed alphabetically after a divider.
 *
 * Source: Razorpay "International currency support" list. If you ever need one
 * that's missing, add a row here — nothing else needs to change.
 */
export type Currency = {
  code: string;
  name: string;
  decimals: 0 | 2 | 3;
};

/** Pinned to the top of the dropdown — the currencies you'll actually use. */
const COMMON_CODES = ["USD", "INR", "EUR", "GBP", "AUD", "CAD", "SGD", "AED"];

export const CURRENCIES: Currency[] = [
  { code: "USD", name: "US Dollar", decimals: 2 },
  { code: "INR", name: "Indian Rupee", decimals: 2 },
  { code: "EUR", name: "Euro", decimals: 2 },
  { code: "GBP", name: "British Pound", decimals: 2 },
  { code: "AUD", name: "Australian Dollar", decimals: 2 },
  { code: "CAD", name: "Canadian Dollar", decimals: 2 },
  { code: "SGD", name: "Singapore Dollar", decimals: 2 },
  { code: "AED", name: "UAE Dirham", decimals: 2 },
  { code: "ALL", name: "Albanian Lek", decimals: 2 },
  { code: "AMD", name: "Armenian Dram", decimals: 2 },
  { code: "ARS", name: "Argentine Peso", decimals: 2 },
  { code: "AWG", name: "Aruban Florin", decimals: 2 },
  { code: "AZN", name: "Azerbaijani Manat", decimals: 2 },
  { code: "BBD", name: "Barbadian Dollar", decimals: 2 },
  { code: "BDT", name: "Bangladeshi Taka", decimals: 2 },
  { code: "BHD", name: "Bahraini Dinar", decimals: 3 },
  { code: "BMD", name: "Bermudian Dollar", decimals: 2 },
  { code: "BND", name: "Brunei Dollar", decimals: 2 },
  { code: "BOB", name: "Bolivian Boliviano", decimals: 2 },
  { code: "BRL", name: "Brazilian Real", decimals: 2 },
  { code: "BSD", name: "Bahamian Dollar", decimals: 2 },
  { code: "BWP", name: "Botswana Pula", decimals: 2 },
  { code: "BZD", name: "Belize Dollar", decimals: 2 },
  { code: "CHF", name: "Swiss Franc", decimals: 2 },
  { code: "CLP", name: "Chilean Peso", decimals: 0 },
  { code: "CNY", name: "Chinese Yuan", decimals: 2 },
  { code: "COP", name: "Colombian Peso", decimals: 2 },
  { code: "CRC", name: "Costa Rican Colón", decimals: 2 },
  { code: "CUP", name: "Cuban Peso", decimals: 2 },
  { code: "CZK", name: "Czech Koruna", decimals: 2 },
  { code: "DKK", name: "Danish Krone", decimals: 2 },
  { code: "DOP", name: "Dominican Peso", decimals: 2 },
  { code: "DZD", name: "Algerian Dinar", decimals: 2 },
  { code: "EGP", name: "Egyptian Pound", decimals: 2 },
  { code: "ETB", name: "Ethiopian Birr", decimals: 2 },
  { code: "FJD", name: "Fijian Dollar", decimals: 2 },
  { code: "GHS", name: "Ghanaian Cedi", decimals: 2 },
  { code: "GIP", name: "Gibraltar Pound", decimals: 2 },
  { code: "GMD", name: "Gambian Dalasi", decimals: 2 },
  { code: "GTQ", name: "Guatemalan Quetzal", decimals: 2 },
  { code: "GYD", name: "Guyanese Dollar", decimals: 2 },
  { code: "HKD", name: "Hong Kong Dollar", decimals: 2 },
  { code: "HNL", name: "Honduran Lempira", decimals: 2 },
  { code: "HRK", name: "Croatian Kuna", decimals: 2 },
  { code: "HTG", name: "Haitian Gourde", decimals: 2 },
  { code: "HUF", name: "Hungarian Forint", decimals: 2 },
  { code: "IDR", name: "Indonesian Rupiah", decimals: 2 },
  { code: "ILS", name: "Israeli New Shekel", decimals: 2 },
  { code: "JMD", name: "Jamaican Dollar", decimals: 2 },
  { code: "JPY", name: "Japanese Yen", decimals: 0 },
  { code: "KES", name: "Kenyan Shilling", decimals: 2 },
  { code: "KGS", name: "Kyrgyzstani Som", decimals: 2 },
  { code: "KHR", name: "Cambodian Riel", decimals: 2 },
  { code: "KRW", name: "South Korean Won", decimals: 0 },
  { code: "KWD", name: "Kuwaiti Dinar", decimals: 3 },
  { code: "KYD", name: "Cayman Islands Dollar", decimals: 2 },
  { code: "KZT", name: "Kazakhstani Tenge", decimals: 2 },
  { code: "LAK", name: "Lao Kip", decimals: 2 },
  { code: "LBP", name: "Lebanese Pound", decimals: 2 },
  { code: "LKR", name: "Sri Lankan Rupee", decimals: 2 },
  { code: "LRD", name: "Liberian Dollar", decimals: 2 },
  { code: "LSL", name: "Lesotho Loti", decimals: 2 },
  { code: "MAD", name: "Moroccan Dirham", decimals: 2 },
  { code: "MDL", name: "Moldovan Leu", decimals: 2 },
  { code: "MKD", name: "Macedonian Denar", decimals: 2 },
  { code: "MMK", name: "Myanmar Kyat", decimals: 2 },
  { code: "MNT", name: "Mongolian Tögrög", decimals: 2 },
  { code: "MOP", name: "Macanese Pataca", decimals: 2 },
  { code: "MUR", name: "Mauritian Rupee", decimals: 2 },
  { code: "MVR", name: "Maldivian Rufiyaa", decimals: 2 },
  { code: "MWK", name: "Malawian Kwacha", decimals: 2 },
  { code: "MXN", name: "Mexican Peso", decimals: 2 },
  { code: "MYR", name: "Malaysian Ringgit", decimals: 2 },
  { code: "MZN", name: "Mozambican Metical", decimals: 2 },
  { code: "NAD", name: "Namibian Dollar", decimals: 2 },
  { code: "NGN", name: "Nigerian Naira", decimals: 2 },
  { code: "NIO", name: "Nicaraguan Córdoba", decimals: 2 },
  { code: "NOK", name: "Norwegian Krone", decimals: 2 },
  { code: "NPR", name: "Nepalese Rupee", decimals: 2 },
  { code: "NZD", name: "New Zealand Dollar", decimals: 2 },
  { code: "OMR", name: "Omani Rial", decimals: 3 },
  { code: "PEN", name: "Peruvian Sol", decimals: 2 },
  { code: "PGK", name: "Papua New Guinean Kina", decimals: 2 },
  { code: "PHP", name: "Philippine Peso", decimals: 2 },
  { code: "PKR", name: "Pakistani Rupee", decimals: 2 },
  { code: "QAR", name: "Qatari Riyal", decimals: 2 },
  { code: "RON", name: "Romanian Leu", decimals: 2 },
  { code: "RUB", name: "Russian Ruble", decimals: 2 },
  { code: "SAR", name: "Saudi Riyal", decimals: 2 },
  { code: "SCR", name: "Seychellois Rupee", decimals: 2 },
  { code: "SEK", name: "Swedish Krona", decimals: 2 },
  { code: "SLL", name: "Sierra Leonean Leone", decimals: 2 },
  { code: "SOS", name: "Somali Shilling", decimals: 2 },
  { code: "SSP", name: "South Sudanese Pound", decimals: 2 },
  { code: "SVC", name: "Salvadoran Colón", decimals: 2 },
  { code: "SZL", name: "Swazi Lilangeni", decimals: 2 },
  { code: "THB", name: "Thai Baht", decimals: 2 },
  { code: "TND", name: "Tunisian Dinar", decimals: 3 },
  { code: "TRY", name: "Turkish Lira", decimals: 2 },
  { code: "TTD", name: "Trinidad & Tobago Dollar", decimals: 2 },
  { code: "TWD", name: "New Taiwan Dollar", decimals: 2 },
  { code: "TZS", name: "Tanzanian Shilling", decimals: 2 },
  { code: "UAH", name: "Ukrainian Hryvnia", decimals: 2 },
  { code: "UGX", name: "Ugandan Shilling", decimals: 0 },
  { code: "UYU", name: "Uruguayan Peso", decimals: 2 },
  { code: "UZS", name: "Uzbekistani Soʻm", decimals: 2 },
  { code: "VND", name: "Vietnamese Đồng", decimals: 0 },
  { code: "YER", name: "Yemeni Rial", decimals: 2 },
  { code: "ZAR", name: "South African Rand", decimals: 2 },
];

/** Fast lookup by ISO code. */
const BY_CODE = new Map(CURRENCIES.map((c) => [c.code, c]));

/** Every supported ISO code. */
export const CURRENCY_CODES: string[] = CURRENCIES.map((c) => c.code);

export function isSupportedCurrency(code: string): boolean {
  return BY_CODE.has(code);
}

export function getCurrency(code: string): Currency | undefined {
  return BY_CODE.get(code);
}

/** Minor-unit places for a currency. Defaults to 2 for anything unknown. */
export function currencyDecimals(code: string): number {
  return BY_CODE.get(code)?.decimals ?? 2;
}

/**
 * Convert a major-unit price (what the admin types, e.g. 99) into the smallest
 * unit Razorpay expects. Respects 0/2/3-decimal currencies.
 *   toMinorUnits(99, "USD") → 9900
 *   toMinorUnits(1000, "JPY") → 1000
 *   toMinorUnits(50, "KWD") → 50000
 */
export function toMinorUnits(majorAmount: number, code: string): number {
  return Math.round(majorAmount * 10 ** currencyDecimals(code));
}

/**
 * Picker-ordered list: COMMON currencies first, then everything else
 * alphabetically by name. Each item has a ready-to-render label.
 */
export function currencyOptions(): Array<{
  code: string;
  label: string;
  pinned: boolean;
}> {
  const common = COMMON_CODES.map((code) => BY_CODE.get(code)!).filter(Boolean);
  const rest = CURRENCIES.filter((c) => !COMMON_CODES.includes(c.code)).sort(
    (a, b) => a.name.localeCompare(b.name),
  );
  const toItem = (c: Currency, pinned: boolean) => ({
    code: c.code,
    label: `${c.code} — ${c.name}`,
    pinned,
  });
  return [
    ...common.map((c) => toItem(c, true)),
    ...rest.map((c) => toItem(c, false)),
  ];
}
