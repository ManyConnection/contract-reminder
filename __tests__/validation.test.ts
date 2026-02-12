import {
  validateContractForm,
  isValidForm,
  validateAmount,
  validateReminderDays,
} from '../src/utils/validation';
import { ContractFormData } from '../src/types';

const createValidFormData = (): ContractFormData => ({
  name: 'Test Contract',
  category: 'subscription',
  billingCycle: 'monthly',
  amount: '1000',
  renewalDate: new Date(),
  reminderDays: '7',
  notes: '',
});

describe('Validation Utilities', () => {
  describe('validateContractForm', () => {
    it('should return no errors for valid form', () => {
      const data = createValidFormData();
      const errors = validateContractForm(data);
      expect(Object.keys(errors)).toHaveLength(0);
    });

    describe('name validation', () => {
      it('should require name', () => {
        const data = { ...createValidFormData(), name: '' };
        const errors = validateContractForm(data);
        expect(errors.name).toBe('契約名を入力してください');
      });

      it('should require name with content (not just spaces)', () => {
        const data = { ...createValidFormData(), name: '   ' };
        const errors = validateContractForm(data);
        expect(errors.name).toBe('契約名を入力してください');
      });

      it('should reject names over 100 characters', () => {
        const data = { ...createValidFormData(), name: 'a'.repeat(101) };
        const errors = validateContractForm(data);
        expect(errors.name).toBe('契約名は100文字以内で入力してください');
      });

      it('should accept names up to 100 characters', () => {
        const data = { ...createValidFormData(), name: 'a'.repeat(100) };
        const errors = validateContractForm(data);
        expect(errors.name).toBeUndefined();
      });
    });

    describe('category validation', () => {
      it('should accept valid categories', () => {
        const categories = ['subscription', 'insurance', 'rental', 'other'] as const;
        categories.forEach((category) => {
          const data = { ...createValidFormData(), category };
          const errors = validateContractForm(data);
          expect(errors.category).toBeUndefined();
        });
      });

      it('should reject invalid category', () => {
        const data = { ...createValidFormData(), category: 'invalid' as any };
        const errors = validateContractForm(data);
        expect(errors.category).toBe('カテゴリを選択してください');
      });
    });

    describe('billingCycle validation', () => {
      it('should accept valid billing cycles', () => {
        const cycles = ['monthly', 'yearly', 'one-time'] as const;
        cycles.forEach((billingCycle) => {
          const data = { ...createValidFormData(), billingCycle };
          const errors = validateContractForm(data);
          expect(errors.billingCycle).toBeUndefined();
        });
      });

      it('should reject invalid billing cycle', () => {
        const data = { ...createValidFormData(), billingCycle: 'weekly' as any };
        const errors = validateContractForm(data);
        expect(errors.billingCycle).toBe('支払い周期を選択してください');
      });
    });

    describe('amount validation', () => {
      it('should require amount', () => {
        const data = { ...createValidFormData(), amount: '' };
        const errors = validateContractForm(data);
        expect(errors.amount).toBe('金額を入力してください');
      });

      it('should reject negative amounts', () => {
        const data = { ...createValidFormData(), amount: '-100' };
        const errors = validateContractForm(data);
        expect(errors.amount).toBe('有効な金額を入力してください');
      });

      it('should reject non-numeric amounts', () => {
        const data = { ...createValidFormData(), amount: 'abc' };
        const errors = validateContractForm(data);
        expect(errors.amount).toBe('有効な金額を入力してください');
      });

      it('should accept zero amount', () => {
        const data = { ...createValidFormData(), amount: '0' };
        const errors = validateContractForm(data);
        expect(errors.amount).toBeUndefined();
      });

      it('should reject amounts over 100 million', () => {
        const data = { ...createValidFormData(), amount: '100000001' };
        const errors = validateContractForm(data);
        expect(errors.amount).toBe('金額が大きすぎます');
      });
    });

    describe('renewalDate validation', () => {
      it('should require renewal date', () => {
        const data = { ...createValidFormData(), renewalDate: null as any };
        const errors = validateContractForm(data);
        expect(errors.renewalDate).toBe('更新日を選択してください');
      });

      it('should accept valid date', () => {
        const data = createValidFormData();
        const errors = validateContractForm(data);
        expect(errors.renewalDate).toBeUndefined();
      });
    });

    describe('reminderDays validation', () => {
      it('should require reminder days', () => {
        const data = { ...createValidFormData(), reminderDays: '' };
        const errors = validateContractForm(data);
        expect(errors.reminderDays).toBe('リマインダー日数を入力してください');
      });

      it('should reject negative days', () => {
        const data = { ...createValidFormData(), reminderDays: '-1' };
        const errors = validateContractForm(data);
        expect(errors.reminderDays).toBe('有効な日数を入力してください');
      });

      it('should reject days over 365', () => {
        const data = { ...createValidFormData(), reminderDays: '366' };
        const errors = validateContractForm(data);
        expect(errors.reminderDays).toBe('リマインダーは365日以内で設定してください');
      });

      it('should accept 0 days', () => {
        const data = { ...createValidFormData(), reminderDays: '0' };
        const errors = validateContractForm(data);
        expect(errors.reminderDays).toBeUndefined();
      });

      it('should accept 365 days', () => {
        const data = { ...createValidFormData(), reminderDays: '365' };
        const errors = validateContractForm(data);
        expect(errors.reminderDays).toBeUndefined();
      });
    });
  });

  describe('isValidForm', () => {
    it('should return true for empty errors', () => {
      expect(isValidForm({})).toBe(true);
    });

    it('should return false for any errors', () => {
      expect(isValidForm({ name: 'error' })).toBe(false);
    });
  });

  describe('validateAmount', () => {
    it('should return true for valid amount', () => {
      expect(validateAmount('1000')).toBe(true);
    });

    it('should return false for empty string', () => {
      expect(validateAmount('')).toBe(false);
    });

    it('should return false for whitespace only', () => {
      expect(validateAmount('   ')).toBe(false);
    });

    it('should return true for zero', () => {
      expect(validateAmount('0')).toBe(true);
    });

    it('should return false for negative', () => {
      expect(validateAmount('-100')).toBe(false);
    });

    it('should return false for over limit', () => {
      expect(validateAmount('100000001')).toBe(false);
    });
  });

  describe('validateReminderDays', () => {
    it('should return true for valid days', () => {
      expect(validateReminderDays('7')).toBe(true);
    });

    it('should return false for empty string', () => {
      expect(validateReminderDays('')).toBe(false);
    });

    it('should return true for zero', () => {
      expect(validateReminderDays('0')).toBe(true);
    });

    it('should return true for 365', () => {
      expect(validateReminderDays('365')).toBe(true);
    });

    it('should return false for over 365', () => {
      expect(validateReminderDays('366')).toBe(false);
    });

    it('should return false for negative', () => {
      expect(validateReminderDays('-1')).toBe(false);
    });
  });
});
