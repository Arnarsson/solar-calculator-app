import Decimal from 'decimal.js';
import { calculateCO2Savings, CO2SavingsInput, CO2SavingsResult } from '../co2Savings';
import { d, DANISH_GRID_CO2_KG_PER_KWH } from '../types';

describe('CO2 Savings Calculation', () => {
  // Reference test case
  it('calculates annual CO2 savings correctly', () => {
    const input: CO2SavingsInput = {
      annualProductionKwh: d('8800'),
    };

    const result = calculateCO2Savings(input);

    // 8800 kWh * 0.5 kg CO2/kWh = 4400 kg CO2
    expect(result.annualCO2SavingsKg.toFixed(2)).toBe('4400.00');
    // 4400 kg = 4.4 tonnes
    expect(result.annualCO2SavingsTonnes.toFixed(2)).toBe('4.40');
  });

  it('calculates 25-year lifetime CO2 savings', () => {
    const input: CO2SavingsInput = {
      annualProductionKwh: d('8800'),
    };

    const result = calculateCO2Savings(input);

    // 4400 kg/year * 25 years = 110,000 kg = 110 tonnes
    // Note: This is simplified - actual calculation could account for degradation
    expect(result.lifetimeCO2SavingsTonnes.toFixed(2)).toBe('110.00');
  });

  it('uses Danish grid emission factor', () => {
    const input: CO2SavingsInput = {
      annualProductionKwh: d('1000'), // 1000 kWh for easy calculation
    };

    const result = calculateCO2Savings(input);

    // 1000 kWh * 0.5 kg/kWh = 500 kg
    expect(result.annualCO2SavingsKg.equals(d('500'))).toBe(true);
    expect(result.emissionFactorKgPerKwh.equals(DANISH_GRID_CO2_KG_PER_KWH)).toBe(true);
  });

  it('provides equivalent metrics for user understanding', () => {
    const input: CO2SavingsInput = {
      annualProductionKwh: d('8800'),
    };

    const result = calculateCO2Savings(input);

    // Equivalent km driven (average car: 120g CO2/km)
    // 4400 kg / 0.12 kg/km = ~36,667 km
    expect(result.equivalentCarKm.greaterThan(d('30000'))).toBe(true);

    // Equivalent trees (1 tree absorbs ~21 kg CO2/year)
    // 4400 kg / 21 kg/tree = ~209 trees
    expect(result.equivalentTreesYear.greaterThan(d('200'))).toBe(true);
  });

  it('handles zero production', () => {
    const input: CO2SavingsInput = {
      annualProductionKwh: d('0'),
    };

    const result = calculateCO2Savings(input);

    expect(result.annualCO2SavingsKg.equals(d('0'))).toBe(true);
    expect(result.lifetimeCO2SavingsTonnes.equals(d('0'))).toBe(true);
  });

  it('allows custom emission factor', () => {
    const input: CO2SavingsInput = {
      annualProductionKwh: d('10000'),
      emissionFactorKgPerKwh: d('0.4'), // Custom lower factor
    };

    const result = calculateCO2Savings(input);

    // 10000 kWh * 0.4 kg/kWh = 4000 kg
    expect(result.annualCO2SavingsKg.toFixed(2)).toBe('4000.00');
    expect(result.emissionFactorKgPerKwh.equals(d('0.4'))).toBe(true);
  });
});
