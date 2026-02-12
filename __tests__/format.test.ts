import {
  formatCurrency,
  formatDate,
  formatDateWithDay,
  formatRelativeDate,
  formatRenewalStatus,
  getUrgencyLevel,
  formatBillingCycle,
  parseCurrency,
  formatNumberInput,
} from '../src/utils/format';

describe('Format Utilities', () => {
  describe('formatCurrency', () => {
    it('should format amount with yen symbol', () => {
      expect(formatCurrency(1000)).toBe('¥1,000');
    });

    it('should handle zero', () => {
      expect(formatCurrency(0)).toBe('¥0');
    });

    it('should format large numbers with commas', () => {
      expect(formatCurrency(1000000)).toBe('¥1,000,000');
    });

    it('should handle negative numbers', () => {
      expect(formatCurrency(-500)).toBe('-¥500');
    });
  });

  describe('formatDate', () => {
    it('should format date in Japanese format', () => {
      const result = formatDate(new Date(2024, 5, 15));
      expect(result).toBe('2024年6月15日');
    });

    it('should handle string dates', () => {
      const result = formatDate('2024-06-15T00:00:00.000Z');
      expect(result).toMatch(/2024年6月1[45]日/);
    });
  });

  describe('formatDateWithDay', () => {
    it('should include day of week', () => {
      const result = formatDateWithDay(new Date(2024, 5, 15));
      expect(result).toMatch(/2024年6月15日/);
      expect(result).toMatch(/（.）/);
    });
  });

  describe('formatRelativeDate', () => {
    it('should return 今日 for today', () => {
      const today = new Date();
      expect(formatRelativeDate(today)).toBe('今日');
    });

    it('should return 明日 for tomorrow', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      expect(formatRelativeDate(tomorrow)).toBe('明日');
    });

    it('should return X日後 for dates within a week', () => {
      const future = new Date();
      future.setDate(future.getDate() + 5);
      expect(formatRelativeDate(future)).toBe('5日後');
    });

    it('should return 約X週間後 for dates within a month', () => {
      const future = new Date();
      future.setDate(future.getDate() + 14);
      expect(formatRelativeDate(future)).toBe('約2週間後');
    });

    it('should return X日前 for past dates', () => {
      const past = new Date();
      past.setDate(past.getDate() - 3);
      expect(formatRelativeDate(past)).toBe('3日前');
    });
  });

  describe('formatRenewalStatus', () => {
    it('should show urgent message for negative days', () => {
      expect(formatRenewalStatus(-5)).toBe('更新期限を5日過ぎています');
    });

    it('should show today message for 0 days', () => {
      expect(formatRenewalStatus(0)).toBe('今日が更新日です');
    });

    it('should show tomorrow message for 1 day', () => {
      expect(formatRenewalStatus(1)).toBe('明日が更新日です');
    });

    it('should show days remaining for within a week', () => {
      expect(formatRenewalStatus(5)).toBe('あと5日で更新日です');
    });

    it('should show simple days for within a month', () => {
      expect(formatRenewalStatus(20)).toBe('あと20日');
    });
  });

  describe('getUrgencyLevel', () => {
    it('should return urgent for 3 days or less', () => {
      expect(getUrgencyLevel(0)).toBe('urgent');
      expect(getUrgencyLevel(3)).toBe('urgent');
    });

    it('should return warning for 4-14 days', () => {
      expect(getUrgencyLevel(4)).toBe('warning');
      expect(getUrgencyLevel(14)).toBe('warning');
    });

    it('should return normal for more than 14 days', () => {
      expect(getUrgencyLevel(15)).toBe('normal');
      expect(getUrgencyLevel(100)).toBe('normal');
    });

    it('should return urgent for negative days', () => {
      expect(getUrgencyLevel(-5)).toBe('urgent');
    });
  });

  describe('formatBillingCycle', () => {
    it('should format monthly amount', () => {
      expect(formatBillingCycle(1000, 'monthly')).toBe('¥1,000/月');
    });

    it('should format yearly amount', () => {
      expect(formatBillingCycle(12000, 'yearly')).toBe('¥12,000/年');
    });

    it('should format one-time amount', () => {
      expect(formatBillingCycle(5000, 'one-time')).toBe('¥5,000（一括）');
    });

    it('should handle unknown cycle', () => {
      expect(formatBillingCycle(1000, 'unknown')).toBe('¥1,000');
    });
  });

  describe('parseCurrency', () => {
    it('should parse currency string to number', () => {
      expect(parseCurrency('¥1,000')).toBe(1000);
    });

    it('should handle plain numbers', () => {
      expect(parseCurrency('500')).toBe(500);
    });

    it('should return 0 for invalid input', () => {
      expect(parseCurrency('abc')).toBe(0);
    });

    it('should handle spaces', () => {
      expect(parseCurrency('¥ 1,000')).toBe(1000);
    });
  });

  describe('formatNumberInput', () => {
    it('should remove non-digit characters', () => {
      expect(formatNumberInput('1,000')).toBe('1000');
    });

    it('should keep digits only', () => {
      expect(formatNumberInput('abc123def')).toBe('123');
    });

    it('should handle empty string', () => {
      expect(formatNumberInput('')).toBe('');
    });
  });
});
