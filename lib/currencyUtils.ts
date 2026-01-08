// lib/currencyUtils.ts

/**
 * Formats a number to a BRL currency string with 4 decimal places for display.
 * The value is not prefixed with R$ to allow for direct editing.
 * @param value The number to format.
 * @returns A string like "1.234,5678".
 */
export function formatCurrencyForInput(value: number | undefined | null): string {
  if (value === undefined || value === null) {
    return '';
  }
  const options = {
    style: 'decimal',
    useGrouping: false, // No thousand separators for easier editing
    minimumFractionDigits: 4,
    maximumFractionDigits: 4,
  };
  return value.toLocaleString('pt-BR', options);
}

/**
 * Formats a number to a BRL currency string with "R$ " prefix and 4 decimal places for display only.
 * @param value The number to format.
 * @returns A string like "R$ 1.234,5678".
 */
export function formatCurrencyForDisplay(value: number | undefined | null): string {
    if (value === undefined || value === null || value === 0) {
        return "";
    }
    const options = {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 4,
        maximumFractionDigits: 4,
    };
    return value.toLocaleString('pt-BR', options);
}


/**
 * Handles the change event of a currency input field.
 * It allows only numbers and one comma.
 * @param value The input value from the event.
 * @returns The sanitized value.
 */
export function handleCurrencyInputChange(value: string): string {
  let newValue = value.replace(/[^0-9,]/g, '');

  // Ensure only one comma is present
  const firstCommaIndex = newValue.indexOf(',');
  if (firstCommaIndex !== -1) {
    newValue = newValue.substring(0, firstCommaIndex + 1) + newValue.substring(firstCommaIndex + 1).replace(/,/g, '');
  }
  
  const parts = newValue.split(',');
  if (parts.length > 1) {
      parts[1] = parts[1].substring(0, 4);
      newValue = parts.join(',');
  }

  return newValue;
}

/**
 * Parses the currency string from the input field to a number.
 * @param value The string value from the input.
 * @returns A number.
 */
export function parseCurrency(value: string): number {
  if (!value) {
    return 0;
  }
  const parsableValue = value.replace(',', '.');
  const number = parseFloat(parsableValue);
  return isNaN(number) ? 0 : number;
}
