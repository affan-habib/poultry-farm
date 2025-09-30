/**
 * Format currency in Bangladeshi Taka (BDT)
 * @param amount - The amount to format
 * @returns Formatted currency string with ৳ symbol
 */
export function formatCurrency(amount: number): string {
  return `৳${amount.toLocaleString("en-BD", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

/**
 * Format currency without decimal places for whole numbers
 * @param amount - The amount to format
 * @returns Formatted currency string with ৳ symbol
 */
export function formatCurrencyWhole(amount: number): string {
  return `৳${amount.toLocaleString("en-BD")}`
}
