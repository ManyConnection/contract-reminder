export type ContractCategory = 'subscription' | 'insurance' | 'rental' | 'other';

export type BillingCycle = 'monthly' | 'yearly' | 'one-time';

export interface Contract {
  id: string;
  name: string;
  category: ContractCategory;
  billingCycle: BillingCycle;
  amount: number;
  renewalDate: string; // ISO date string
  reminderDays: number; // Days before renewal to remind
  notificationId?: string; // ID for scheduled notification
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ContractFormData {
  name: string;
  category: ContractCategory;
  billingCycle: BillingCycle;
  amount: string;
  renewalDate: Date;
  reminderDays: string;
  notes: string;
}

export const CATEGORY_LABELS: Record<ContractCategory, string> = {
  subscription: 'サブスク',
  insurance: '保険',
  rental: '賃貸',
  other: 'その他',
};

export const CATEGORY_EMOJIS: Record<ContractCategory, string> = {
  subscription: '📱',
  insurance: '🛡️',
  rental: '🏠',
  other: '📋',
};

export const BILLING_CYCLE_LABELS: Record<BillingCycle, string> = {
  monthly: '月額',
  yearly: '年額',
  'one-time': '一括',
};

export const DEFAULT_REMINDER_DAYS = 7;
