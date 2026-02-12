import {
  formatCurrency,
  formatDate,
  formatRelativeDate,
  formatRenewalStatus,
  getUrgencyLevel,
  formatBillingCycle,
  parseCurrency,
  formatNumberInput,
} from '../utils/format';

describe('Format utilities', () => {
  describe('formatCurrency', () => {
    it('should format positive amounts with yen symbol', () => {
      expect(formatCurrency(1500)).toBe('¥1,500');
    });

    it('should format zero', () => {
      expect(formatCurrency(0)).toBe('¥0');
    });

    it('should format large amounts with commas', () => {
      expect(formatCurrency(1234567)).toBe('¥1,234,567');
    });
  });

  describe('formatDate', () => {
    it('should format date in Japanese format', () => {
      const result = formatDate('2024-12-25T00:00:00.000Z');
      expect(result).toContain('12月25日');
    });

    it('should accept Date objects', () => {
      const date = new Date(2024, 11, 25);
      const result = formatDate(date);
      expect(result).toContain('12月25日');
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

    it('should return X日後 for near future', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 5);
      expect(formatRelativeDate(futureDate)).toBe('5日後');
    });

    it('should return X日前 for past dates', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 3);
      expect(formatRelativeDate(pastDate)).toBe('3日前');
    });
  });

  describe('formatRenewalStatus', () => {
    it('should show overdue message for negative days', () => {
      expect(formatRenewalStatus(-5)).toBe('更新期限を5日過ぎています');
    });

    it('should show today message for 0 days', () => {
      expect(formatRenewalStatus(0)).toBe('今日が更新日です');
    });

    it('should show tomorrow message for 1 day', () => {
      expect(formatRenewalStatus(1)).toBe('明日が更新日です');
    });

    it('should show days remaining for near future', () => {
      expect(formatRenewalStatus(5)).toBe('あと5日で更新日です');
    });
  });

  describe('getUrgencyLevel', () => {
    it('should return urgent for 3 days or less', () => {
      expect(getUrgencyLevel(0)).toBe('urgent');
      expect(getUrgencyLevel(3)).toBe('urgent');
    });

    it('should return warning for 4-14 days', () => {
      expect(getUrgencyLevel(7)).toBe('warning');
      expect(getUrgencyLevel(14)).toBe('warning');
    });

    it('should return normal for more than 14 days', () => {
      expect(getUrgencyLevel(15)).toBe('normal');
      expect(getUrgencyLevel(30)).toBe('normal');
    });
  });

  describe('formatBillingCycle', () => {
    it('should format monthly billing', () => {
      expect(formatBillingCycle(1000, 'monthly')).toBe('¥1,000/月');
    });

    it('should format yearly billing', () => {
      expect(formatBillingCycle(10000, 'yearly')).toBe('¥10,000/年');
    });

    it('should format one-time billing', () => {
      expect(formatBillingCycle(5000, 'one-time')).toBe('¥5,000（一括）');
    });
  });

  describe('parseCurrency', () => {
    it('should parse currency string to number', () => {
      expect(parseCurrency('¥1,500')).toBe(1500);
    });

    it('should handle plain numbers', () => {
      expect(parseCurrency('1000')).toBe(1000);
    });

    it('should return 0 for invalid input', () => {
      expect(parseCurrency('abc')).toBe(0);
    });
  });

  describe('formatNumberInput', () => {
    it('should remove non-digit characters', () => {
      expect(formatNumberInput('1,500円')).toBe('1500');
    });

    it('should keep only digits', () => {
      expect(formatNumberInput('abc123def')).toBe('123');
    });
  });
});
