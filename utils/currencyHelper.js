// utils/currencyHelper.js
export default function formatCurrency(amount, currency = 'NGN', locale = 'en-NG') {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
  }).format(amount);
}
