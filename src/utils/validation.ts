import { ContractFormData, ContractCategory, BillingCycle } from '../types';

export interface ValidationErrors {
  name?: string;
  category?: string;
  billingCycle?: string;
  amount?: string;
  renewalDate?: string;
  reminderDays?: string;
}

export function validateContractForm(data: ContractFormData): ValidationErrors {
  const errors: ValidationErrors = {};

  // Name validation
  if (!data.name.trim()) {
    errors.name = '契約名を入力してください';
  } else if (data.name.length > 100) {
    errors.name = '契約名は100文字以内で入力してください';
  }

  // Category validation
  const validCategories: ContractCategory[] = ['subscription', 'insurance', 'rental', 'other'];
  if (!validCategories.includes(data.category)) {
    errors.category = 'カテゴリを選択してください';
  }

  // Billing cycle validation
  const validCycles: BillingCycle[] = ['monthly', 'yearly', 'one-time'];
  if (!validCycles.includes(data.billingCycle)) {
    errors.billingCycle = '支払い周期を選択してください';
  }

  // Amount validation
  const amount = parseInt(data.amount, 10);
  if (!data.amount.trim()) {
    errors.amount = '金額を入力してください';
  } else if (isNaN(amount) || amount < 0) {
    errors.amount = '有効な金額を入力してください';
  } else if (amount > 100000000) {
    errors.amount = '金額が大きすぎます';
  }

  // Renewal date validation
  if (!data.renewalDate) {
    errors.renewalDate = '更新日を選択してください';
  }

  // Reminder days validation
  const reminderDays = parseInt(data.reminderDays, 10);
  if (!data.reminderDays.trim()) {
    errors.reminderDays = 'リマインダー日数を入力してください';
  } else if (isNaN(reminderDays) || reminderDays < 0) {
    errors.reminderDays = '有効な日数を入力してください';
  } else if (reminderDays > 365) {
    errors.reminderDays = 'リマインダーは365日以内で設定してください';
  }

  return errors;
}

export function isValidForm(errors: ValidationErrors): boolean {
  return Object.keys(errors).length === 0;
}

export function validateAmount(value: string): boolean {
  if (!value.trim()) return false;
  const num = parseInt(value, 10);
  return !isNaN(num) && num >= 0 && num <= 100000000;
}

export function validateReminderDays(value: string): boolean {
  if (!value.trim()) return false;
  const num = parseInt(value, 10);
  return !isNaN(num) && num >= 0 && num <= 365;
}
