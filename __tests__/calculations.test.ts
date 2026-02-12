import {
  calculateAnnualCost,
  calculateMonthlyCost,
  calculateTotalAnnualCost,
  calculateTotalMonthlyCost,
  calculateCostByCategory,
  groupByCategory,
  getUpcomingRenewals,
  sortByRenewalDate,
  sortByAmount,
  filterByCategory,
  searchContracts,
  isRenewalPassed,
  getDaysUntilRenewal,
} from '../src/utils/calculations';
import { Contract } from '../src/types';

const createContract = (overrides: Partial<Contract> = {}): Contract => ({
  id: 'test-id',
  name: 'Test Contract',
  category: 'subscription',
  billingCycle: 'monthly',
  amount: 1000,
  renewalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  reminderDays: 7,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

describe('Calculation Utilities', () => {
  describe('calculateAnnualCost', () => {
    it('should multiply monthly amount by 12', () => {
      const contract = createContract({ billingCycle: 'monthly', amount: 1000 });
      expect(calculateAnnualCost(contract)).toBe(12000);
    });

    it('should return yearly amount as is', () => {
      const contract = createContract({ billingCycle: 'yearly', amount: 12000 });
      expect(calculateAnnualCost(contract)).toBe(12000);
    });

    it('should return 0 for one-time payments', () => {
      const contract = createContract({ billingCycle: 'one-time', amount: 5000 });
      expect(calculateAnnualCost(contract)).toBe(0);
    });

    it('should handle zero amount', () => {
      const contract = createContract({ billingCycle: 'monthly', amount: 0 });
      expect(calculateAnnualCost(contract)).toBe(0);
    });
  });

  describe('calculateMonthlyCost', () => {
    it('should return monthly amount as is', () => {
      const contract = createContract({ billingCycle: 'monthly', amount: 1000 });
      expect(calculateMonthlyCost(contract)).toBe(1000);
    });

    it('should divide yearly amount by 12', () => {
      const contract = createContract({ billingCycle: 'yearly', amount: 12000 });
      expect(calculateMonthlyCost(contract)).toBe(1000);
    });

    it('should round yearly to monthly conversion', () => {
      const contract = createContract({ billingCycle: 'yearly', amount: 10000 });
      expect(calculateMonthlyCost(contract)).toBe(833);
    });

    it('should return 0 for one-time payments', () => {
      const contract = createContract({ billingCycle: 'one-time', amount: 5000 });
      expect(calculateMonthlyCost(contract)).toBe(0);
    });
  });

  describe('calculateTotalAnnualCost', () => {
    it('should sum annual costs of all contracts', () => {
      const contracts = [
        createContract({ id: '1', billingCycle: 'monthly', amount: 1000 }),
        createContract({ id: '2', billingCycle: 'yearly', amount: 6000 }),
      ];
      expect(calculateTotalAnnualCost(contracts)).toBe(18000);
    });

    it('should return 0 for empty array', () => {
      expect(calculateTotalAnnualCost([])).toBe(0);
    });

    it('should exclude one-time payments', () => {
      const contracts = [
        createContract({ id: '1', billingCycle: 'monthly', amount: 1000 }),
        createContract({ id: '2', billingCycle: 'one-time', amount: 50000 }),
      ];
      expect(calculateTotalAnnualCost(contracts)).toBe(12000);
    });
  });

  describe('calculateTotalMonthlyCost', () => {
    it('should sum monthly costs of all contracts', () => {
      const contracts = [
        createContract({ id: '1', billingCycle: 'monthly', amount: 1000 }),
        createContract({ id: '2', billingCycle: 'yearly', amount: 12000 }),
      ];
      expect(calculateTotalMonthlyCost(contracts)).toBe(2000);
    });

    it('should return 0 for empty array', () => {
      expect(calculateTotalMonthlyCost([])).toBe(0);
    });
  });

  describe('calculateCostByCategory', () => {
    it('should group costs by category', () => {
      const contracts = [
        createContract({ id: '1', category: 'subscription', amount: 1000 }),
        createContract({ id: '2', category: 'insurance', billingCycle: 'yearly', amount: 12000 }),
        createContract({ id: '3', category: 'subscription', amount: 500 }),
      ];
      const result = calculateCostByCategory(contracts);
      expect(result.subscription).toBe(18000);
      expect(result.insurance).toBe(12000);
      expect(result.rental).toBe(0);
      expect(result.other).toBe(0);
    });

    it('should return zeros for empty array', () => {
      const result = calculateCostByCategory([]);
      expect(result.subscription).toBe(0);
      expect(result.insurance).toBe(0);
      expect(result.rental).toBe(0);
      expect(result.other).toBe(0);
    });
  });

  describe('groupByCategory', () => {
    it('should group contracts by category', () => {
      const contracts = [
        createContract({ id: '1', category: 'subscription' }),
        createContract({ id: '2', category: 'insurance' }),
        createContract({ id: '3', category: 'subscription' }),
      ];
      const result = groupByCategory(contracts);
      expect(result.subscription).toHaveLength(2);
      expect(result.insurance).toHaveLength(1);
      expect(result.rental).toHaveLength(0);
      expect(result.other).toHaveLength(0);
    });

    it('should return empty arrays for no contracts', () => {
      const result = groupByCategory([]);
      expect(result.subscription).toHaveLength(0);
      expect(result.insurance).toHaveLength(0);
    });
  });

  describe('getUpcomingRenewals', () => {
    it('should return contracts within specified days', () => {
      const contracts = [
        createContract({ id: '1', renewalDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString() }),
        createContract({ id: '2', renewalDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString() }),
      ];
      const result = getUpcomingRenewals(contracts, 30);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('1');
    });

    it('should exclude past renewals', () => {
      const contracts = [
        createContract({ id: '1', renewalDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() }),
      ];
      const result = getUpcomingRenewals(contracts, 30);
      expect(result).toHaveLength(0);
    });
  });

  describe('sortByRenewalDate', () => {
    it('should sort by renewal date ascending', () => {
      const contracts = [
        createContract({ id: '1', renewalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() }),
        createContract({ id: '2', renewalDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString() }),
      ];
      const result = sortByRenewalDate(contracts, true);
      expect(result[0].id).toBe('2');
      expect(result[1].id).toBe('1');
    });

    it('should sort by renewal date descending', () => {
      const contracts = [
        createContract({ id: '1', renewalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() }),
        createContract({ id: '2', renewalDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString() }),
      ];
      const result = sortByRenewalDate(contracts, false);
      expect(result[0].id).toBe('1');
      expect(result[1].id).toBe('2');
    });

    it('should not mutate original array', () => {
      const contracts = [
        createContract({ id: '1', renewalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() }),
      ];
      const result = sortByRenewalDate(contracts);
      expect(result).not.toBe(contracts);
    });
  });

  describe('sortByAmount', () => {
    it('should sort by annual cost descending', () => {
      const contracts = [
        createContract({ id: '1', amount: 1000 }),
        createContract({ id: '2', amount: 2000 }),
      ];
      const result = sortByAmount(contracts);
      expect(result[0].id).toBe('2');
      expect(result[1].id).toBe('1');
    });
  });

  describe('filterByCategory', () => {
    it('should filter contracts by category', () => {
      const contracts = [
        createContract({ id: '1', category: 'subscription' }),
        createContract({ id: '2', category: 'insurance' }),
      ];
      const result = filterByCategory(contracts, 'subscription');
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('1');
    });

    it('should return empty array if no matches', () => {
      const contracts = [createContract({ category: 'subscription' })];
      const result = filterByCategory(contracts, 'rental');
      expect(result).toHaveLength(0);
    });
  });

  describe('searchContracts', () => {
    it('should find contracts by name (case insensitive)', () => {
      const contracts = [
        createContract({ id: '1', name: 'Netflix' }),
        createContract({ id: '2', name: 'Spotify' }),
      ];
      const result = searchContracts(contracts, 'net');
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('1');
    });

    it('should return empty array for no matches', () => {
      const contracts = [createContract({ name: 'Netflix' })];
      const result = searchContracts(contracts, 'amazon');
      expect(result).toHaveLength(0);
    });
  });

  describe('isRenewalPassed', () => {
    it('should return true if renewal date is in the past', () => {
      const contract = createContract({
        renewalDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      });
      expect(isRenewalPassed(contract)).toBe(true);
    });

    it('should return false if renewal date is in the future', () => {
      const contract = createContract({
        renewalDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      });
      expect(isRenewalPassed(contract)).toBe(false);
    });
  });

  describe('getDaysUntilRenewal', () => {
    it('should return positive days for future renewal', () => {
      const contract = createContract({
        renewalDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
      });
      const days = getDaysUntilRenewal(contract);
      expect(days).toBeGreaterThanOrEqual(9);
      expect(days).toBeLessThanOrEqual(11);
    });

    it('should return negative days for past renewal', () => {
      const contract = createContract({
        renewalDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      });
      const days = getDaysUntilRenewal(contract);
      expect(days).toBeLessThan(0);
    });
  });
});
