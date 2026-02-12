import { validateContractForm, isValidForm, validateAmount, validateReminderDays } from '../utils/validation';
import { ContractFormData } from '../types';

describe('Validation utilities', () => {
  const validFormData: ContractFormData = {
    name: 'Netflix',
    category: 'subscription',
    billingCycle: 'monthly',
    amount: '1500',
    renewalDate: new Date(),
    reminderDays: '7',
    notes: '',
  };

  describe('validateContractForm', () => {
    it('should return no errors for valid data', () => {
      const errors = validateContractForm(validFormData);
      expect(Object.keys(errors)).toHaveLength(0);
    });

    it('should return error for empty name', () => {
      const data = { ...validFormData, name: '' };
      const errors = validateContractForm(data);
      expect(errors.name).toBe('契約名を入力してください');
    });

    it('should return error for too long name', () => {
      const data = { ...validFormData, name: 'a'.repeat(101) };
      const errors = validateContractForm(data);
      expect(errors.name).toBe('契約名は100文字以内で入力してください');
    });

    it('should return error for empty amount', () => {
      const data = { ...validFormData, amount: '' };
      const errors = validateContractForm(data);
      expect(errors.amount).toBe('金額を入力してください');
    });

    it('should return error for negative amount', () => {
      const data = { ...validFormData, amount: '-100' };
      const errors = validateContractForm(data);
      expect(errors.amount).toBe('有効な金額を入力してください');
    });

    it('should return error for amount exceeding limit', () => {
      const data = { ...validFormData, amount: '100000001' };
      const errors = validateContractForm(data);
      expect(errors.amount).toBe('金額が大きすぎます');
    });

    it('should return error for empty reminder days', () => {
      const data = { ...validFormData, reminderDays: '' };
      const errors = validateContractForm(data);
      expect(errors.reminderDays).toBe('リマインダー日数を入力してください');
    });

    it('should return error for reminder days exceeding 365', () => {
      const data = { ...validFormData, reminderDays: '400' };
      const errors = validateContractForm(data);
      expect(errors.reminderDays).toBe('リマインダーは365日以内で設定してください');
    });
  });

  describe('isValidForm', () => {
    it('should return true for empty errors object', () => {
      expect(isValidForm({})).toBe(true);
    });

    it('should return false when errors exist', () => {
      expect(isValidForm({ name: 'Error message' })).toBe(false);
    });
  });

  describe('validateAmount', () => {
    it('should return true for valid amount', () => {
      expect(validateAmount('1500')).toBe(true);
    });

    it('should return false for empty string', () => {
      expect(validateAmount('')).toBe(false);
    });

    it('should return false for negative amount', () => {
      expect(validateAmount('-100')).toBe(false);
    });

    it('should return false for amount exceeding limit', () => {
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

    it('should return false for days exceeding 365', () => {
      expect(validateReminderDays('400')).toBe(false);
    });

    it('should return true for 0 days', () => {
      expect(validateReminderDays('0')).toBe(true);
    });
  });
});
