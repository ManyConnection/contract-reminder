import {
  calculateAnnualCost,
  calculateMonthlyCost,
  calculateTotalAnnualCost,
  calculateTotalMonthlyCost,
  calculateCostByCategory,
  sortByRenewalDate,
  filterByCategory,
  getUpcomingRenewals,
  getDaysUntilRenewal,
  isRenewalPassed,
} from '../utils/calculations';
import { Contract } from '../types';

describe('Calculations', () => {
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

  describe('calculateAnnualCost', () => {
    it('should calculate annual cost for monthly billing', () => {
      const contract = createContract({ amount: 1000, billingCycle: 'monthly' });
      expect(calculateAnnualCost(contract)).toBe(12000);
    });

    it('should return amount for yearly billing', () => {
      const contract = createContract({ amount: 10000, billingCycle: 'yearly' });
      expect(calculateAnnualCost(contract)).toBe(10000);
    });

    it('should return 0 for one-time billing', () => {
      const contract = createContract({ amount: 5000, billingCycle: 'one-time' });
      expect(calculateAnnualCost(contract)).toBe(0);
    });
  });

  describe('calculateMonthlyCost', () => {
    it('should return amount for monthly billing', () => {
      const contract = createContract({ amount: 1000, billingCycle: 'monthly' });
      expect(calculateMonthlyCost(contract)).toBe(1000);
    });

    it('should divide yearly amount by 12', () => {
      const contract = createContract({ amount: 12000, billingCycle: 'yearly' });
      expect(calculateMonthlyCost(contract)).toBe(1000);
    });

    it('should return 0 for one-time billing', () => {
      const contract = createContract({ amount: 5000, billingCycle: 'one-time' });
      expect(calculateMonthlyCost(contract)).toBe(0);
    });
  });

  describe('calculateTotalAnnualCost', () => {
    it('should sum all annual costs', () => {
      const contracts = [
        createContract({ id: '1', amount: 1000, billingCycle: 'monthly' }),
        createContract({ id: '2', amount: 2000, billingCycle: 'yearly' }),
      ];
      expect(calculateTotalAnnualCost(contracts)).toBe(14000); // 12000 + 2000
    });

    it('should return 0 for empty array', () => {
      expect(calculateTotalAnnualCost([])).toBe(0);
    });
  });

  describe('calculateTotalMonthlyCost', () => {
    it('should sum all monthly costs', () => {
      const contracts = [
        createContract({ id: '1', amount: 1000, billingCycle: 'monthly' }),
        createContract({ id: '2', amount: 1200, billingCycle: 'yearly' }),
      ];
      expect(calculateTotalMonthlyCost(contracts)).toBe(1100); // 1000 + 100
    });
  });

  describe('calculateCostByCategory', () => {
    it('should group costs by category', () => {
      const contracts = [
        createContract({ id: '1', amount: 1000, category: 'subscription', billingCycle: 'monthly' }),
        createContract({ id: '2', amount: 500, category: 'subscription', billingCycle: 'monthly' }),
        createContract({ id: '3', amount: 10000, category: 'insurance', billingCycle: 'yearly' }),
      ];
      
      const result = calculateCostByCategory(contracts);
      expect(result.subscription).toBe(18000); // (1000 + 500) * 12
      expect(result.insurance).toBe(10000);
      expect(result.rental).toBe(0);
      expect(result.other).toBe(0);
    });
  });

  describe('sortByRenewalDate', () => {
    it('should sort contracts by renewal date ascending', () => {
      const contracts = [
        createContract({ id: '1', name: 'Later', renewalDate: '2025-12-01T00:00:00.000Z' }),
        createContract({ id: '2', name: 'Earlier', renewalDate: '2025-03-01T00:00:00.000Z' }),
        createContract({ id: '3', name: 'Middle', renewalDate: '2025-06-01T00:00:00.000Z' }),
      ];
      
      const sorted = sortByRenewalDate(contracts);
      expect(sorted[0].name).toBe('Earlier');
      expect(sorted[1].name).toBe('Middle');
      expect(sorted[2].name).toBe('Later');
    });

    it('should sort descending when specified', () => {
      const contracts = [
        createContract({ id: '1', name: 'Earlier', renewalDate: '2025-03-01T00:00:00.000Z' }),
        createContract({ id: '2', name: 'Later', renewalDate: '2025-12-01T00:00:00.000Z' }),
      ];
      
      const sorted = sortByRenewalDate(contracts, false);
      expect(sorted[0].name).toBe('Later');
      expect(sorted[1].name).toBe('Earlier');
    });
  });

  describe('filterByCategory', () => {
    it('should filter contracts by category', () => {
      const contracts = [
        createContract({ id: '1', category: 'subscription' }),
        createContract({ id: '2', category: 'insurance' }),
        createContract({ id: '3', category: 'subscription' }),
      ];
      
      const subscriptions = filterByCategory(contracts, 'subscription');
      expect(subscriptions).toHaveLength(2);
      expect(subscriptions.every(c => c.category === 'subscription')).toBe(true);
    });
  });

  describe('getUpcomingRenewals', () => {
    it('should return contracts within specified days', () => {
      const now = Date.now();
      const contracts = [
        createContract({ id: '1', renewalDate: new Date(now + 10 * 24 * 60 * 60 * 1000).toISOString() }),
        createContract({ id: '2', renewalDate: new Date(now + 60 * 24 * 60 * 60 * 1000).toISOString() }),
      ];
      
      const upcoming = getUpcomingRenewals(contracts, 30);
      expect(upcoming).toHaveLength(1);
    });

    it('should not include past renewals', () => {
      const contracts = [
        createContract({ id: '1', renewalDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() }),
      ];
      
      const upcoming = getUpcomingRenewals(contracts, 30);
      expect(upcoming).toHaveLength(0);
    });
  });

  describe('getDaysUntilRenewal', () => {
    it('should return positive days for future dates', () => {
      const contract = createContract({
        renewalDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
      });
      expect(getDaysUntilRenewal(contract)).toBe(10);
    });

    it('should return negative days for past dates', () => {
      const contract = createContract({
        renewalDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      });
      expect(getDaysUntilRenewal(contract)).toBe(-5);
    });
  });

  describe('isRenewalPassed', () => {
    it('should return true for past dates', () => {
      const contract = createContract({
        renewalDate: new Date(Date.now() - 1000).toISOString(),
      });
      expect(isRenewalPassed(contract)).toBe(true);
    });

    it('should return false for future dates', () => {
      const contract = createContract({
        renewalDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
      });
      expect(isRenewalPassed(contract)).toBe(false);
    });
  });
});
