import {
  ContractCategory,
  BillingCycle,
  Contract,
  CATEGORY_LABELS,
  CATEGORY_EMOJIS,
  BILLING_CYCLE_LABELS,
  DEFAULT_REMINDER_DAYS,
} from '../src/types';

describe('Types and Constants', () => {
  describe('CATEGORY_LABELS', () => {
    it('should have label for subscription', () => {
      expect(CATEGORY_LABELS.subscription).toBe('サブスク');
    });

    it('should have label for insurance', () => {
      expect(CATEGORY_LABELS.insurance).toBe('保険');
    });

    it('should have label for rental', () => {
      expect(CATEGORY_LABELS.rental).toBe('賃貸');
    });

    it('should have label for other', () => {
      expect(CATEGORY_LABELS.other).toBe('その他');
    });

    it('should have all four categories', () => {
      expect(Object.keys(CATEGORY_LABELS)).toHaveLength(4);
    });
  });

  describe('CATEGORY_EMOJIS', () => {
    it('should have emoji for subscription', () => {
      expect(CATEGORY_EMOJIS.subscription).toBe('📱');
    });

    it('should have emoji for insurance', () => {
      expect(CATEGORY_EMOJIS.insurance).toBe('🛡️');
    });

    it('should have emoji for rental', () => {
      expect(CATEGORY_EMOJIS.rental).toBe('🏠');
    });

    it('should have emoji for other', () => {
      expect(CATEGORY_EMOJIS.other).toBe('📋');
    });
  });

  describe('BILLING_CYCLE_LABELS', () => {
    it('should have label for monthly', () => {
      expect(BILLING_CYCLE_LABELS.monthly).toBe('月額');
    });

    it('should have label for yearly', () => {
      expect(BILLING_CYCLE_LABELS.yearly).toBe('年額');
    });

    it('should have label for one-time', () => {
      expect(BILLING_CYCLE_LABELS['one-time']).toBe('一括');
    });
  });

  describe('DEFAULT_REMINDER_DAYS', () => {
    it('should be 7 days', () => {
      expect(DEFAULT_REMINDER_DAYS).toBe(7);
    });
  });
});
