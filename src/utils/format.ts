import { format, formatDistanceToNow, isToday, isTomorrow, differenceInDays } from 'date-fns';
import { ja } from 'date-fns/locale';

/**
 * Format currency in Japanese Yen
 */
export function formatCurrency(amount: number): string {
  if (amount < 0) {
    return `-¥${Math.abs(amount).toLocaleString('ja-JP')}`;
  }
  return `¥${amount.toLocaleString('ja-JP')}`;
}

/**
 * Format a date for display
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, 'yyyy年M月d日', { locale: ja });
}

/**
 * Format date with day of week
 */
export function formatDateWithDay(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, 'yyyy年M月d日（E）', { locale: ja });
}

/**
 * Format relative date (e.g., "3日後", "明日")
 */
export function formatRelativeDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const days = differenceInDays(d, now);

  if (isToday(d)) {
    return '今日';
  }
  if (isTomorrow(d)) {
    return '明日';
  }
  if (days < 0) {
    return `${Math.abs(days)}日前`;
  }
  if (days <= 7) {
    return `${days}日後`;
  }
  if (days <= 30) {
    const weeks = Math.floor(days / 7);
    return `約${weeks}週間後`;
  }
  if (days <= 365) {
    const months = Math.floor(days / 30);
    return `約${months}ヶ月後`;
  }
  const years = Math.floor(days / 365);
  return `約${years}年後`;
}

/**
 * Format renewal status message
 */
export function formatRenewalStatus(daysUntil: number): string {
  if (daysUntil < 0) {
    return `更新期限を${Math.abs(daysUntil)}日過ぎています`;
  }
  if (daysUntil === 0) {
    return '今日が更新日です';
  }
  if (daysUntil === 1) {
    return '明日が更新日です';
  }
  if (daysUntil <= 7) {
    return `あと${daysUntil}日で更新日です`;
  }
  if (daysUntil <= 30) {
    return `あと${daysUntil}日`;
  }
  return formatRelativeDate(new Date(Date.now() + daysUntil * 24 * 60 * 60 * 1000));
}

/**
 * Get urgency level based on days until renewal
 */
export function getUrgencyLevel(daysUntil: number): 'urgent' | 'warning' | 'normal' {
  if (daysUntil <= 3) {
    return 'urgent';
  }
  if (daysUntil <= 14) {
    return 'warning';
  }
  return 'normal';
}

/**
 * Format billing cycle display
 */
export function formatBillingCycle(amount: number, cycle: string): string {
  const formattedAmount = formatCurrency(amount);
  switch (cycle) {
    case 'monthly':
      return `${formattedAmount}/月`;
    case 'yearly':
      return `${formattedAmount}/年`;
    case 'one-time':
      return `${formattedAmount}（一括）`;
    default:
      return formattedAmount;
  }
}

/**
 * Parse currency string to number
 */
export function parseCurrency(value: string): number {
  const cleaned = value.replace(/[¥,\s]/g, '');
  const num = parseInt(cleaned, 10);
  return isNaN(num) ? 0 : num;
}

/**
 * Format number input (remove non-digits)
 */
export function formatNumberInput(value: string): string {
  return value.replace(/[^0-9]/g, '');
}
