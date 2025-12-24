// Exchange rates relative to EUR (Base)
const EXCHANGE_RATES: { [key: string]: number } = {
    EUR: 1,
    USD: 1.05,
    GBP: 0.85,
    CAD: 1.45,
    AUD: 1.62,
    JPY: 157.50,
    CNY: 7.65,
    INR: 87.50,
    BRL: 5.25,
    ZAR: 19.80,
    XOF: 655.96, // Fixed peg
    MAD: 10.85,
    NGN: 1300.00, // Highly volatile, indicative
};

export const SUPPORTED_CURRENCIES = Object.keys(EXCHANGE_RATES);

/**
 * Converts an amount from one currency to another.
 * @param amount The amount to convert
 * @param fromCurrency The currency code of the amount (e.g., 'USD')
 * @param toCurrency The target currency code (e.g., 'EUR')
 * @returns The converted amount
 */
export const convertCurrency = (amount: number, fromCurrency: string, toCurrency: string = 'EUR'): number => {
    const fromRate = EXCHANGE_RATES[fromCurrency] || 1;
    const toRate = EXCHANGE_RATES[toCurrency] || 1;

    if (fromCurrency === toCurrency) return amount;

    // Convert to EUR first, then to target
    const amountInEur = amount / fromRate;
    return amountInEur * toRate;
};

/**
 * Formats a number as a currency string.
 * @param amount The amount to format
 * @param currencyCode The currency code (e.g., 'EUR')
 * @returns Formatted string (e.g., "1 250,00 €")
 */
export const formatCurrency = (amount: number, currencyCode: string = 'EUR') => {
    try {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: currencyCode,
            maximumFractionDigits: currencyCode === 'XOF' || currencyCode === 'JPY' ? 0 : 2
        }).format(amount);
    } catch (e) {
        return `${amount.toFixed(2)} ${currencyCode}`;
    }
};
