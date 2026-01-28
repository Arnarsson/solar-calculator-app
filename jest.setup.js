// Configure Decimal.js for consistent test behavior
const Decimal = require('decimal.js');
Decimal.set({ precision: 20, rounding: Decimal.ROUND_HALF_UP });
