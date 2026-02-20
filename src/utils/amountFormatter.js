/*
 * Fix for USDT/CRYPTO amount display precision issues
 * Addresses floating point precision errors in cryptocurrency amount displays
 */

// Fixed implementation to avoid floating point errors
function formatCryptoAmount(amount, decimals = 18, symbol = 'USDT') {
  // Handle both string and number inputs to prevent floating point issues
  let amountBigInt;

  if (typeof amount === 'string') {
    // Ensure the string contains only numbers
    amountBigInt = BigInt(amount.replace(/[^0-9]/g, '') || '0');
  } else if (typeof amount === 'number') {
    // Convert number to BigInt representation to avoid floating point errors
    amountBigInt = BigInt(Math.round(amount * Math.pow(10, decimals)));
  } else {
    amountBigInt = BigInt(0);
  }

  // Calculate whole and fractional parts using BigInt to maintain precision
  const divisor = BigInt(Math.pow(10, decimals));
  const whole = amountBigInt / divisor;
  const fraction = amountBigInt % divisor;

  // Format fraction part without trailing zeros
  let fractionStr = fraction.toString().padStart(decimals, '0');
  // Remove trailing zeros but keep at least one digit if there's a fraction
  fractionStr = fractionStr.replace(/0+$/, '');

  const formattedAmount = fractionStr ? `${whole}.${fractionStr}` : whole.toString();

  return {
    amount: formattedAmount,
    original: amount,
    symbol: symbol,
    formatted: `${formattedAmount} ${symbol}`
  };
}

// Additional utility function for safe arithmetic operations
function safeAdd(amount1, amount2, decimals = 18) {
  const bigInt1 = typeof amount1 === 'string' ? BigInt(amount1) : BigInt(Math.round(Number(amount1) * Math.pow(10, decimals)));
  const bigInt2 = typeof amount2 === 'string' ? BigInt(amount2) : BigInt(Math.round(Number(amount2) * Math.pow(10, decimals)));

  return (bigInt1 + bigInt2).toString();
}

function safeMultiply(amount, multiplier, decimals = 18) {
  const bigIntAmount = typeof amount === 'string' ? BigInt(amount) : BigInt(Math.round(Number(amount) * Math.pow(10, decimals)));
  const result = (bigIntAmount * BigInt(Math.round(multiplier * Math.pow(10, decimals)))) / BigInt(Math.pow(10, decimals));

  return result.toString();
}

module.exports = {
  formatCryptoAmount,
  safeAdd,
  safeMultiply
};
