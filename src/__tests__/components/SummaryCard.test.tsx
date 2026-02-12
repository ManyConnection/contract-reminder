import React from 'react';
import { render } from '@testing-library/react-native';
import { SummaryCard } from '../../components/SummaryCard';
import { Contract } from '../../types';

describe('SummaryCard', () => {
  const createContract = (overrides: Partial<Contract> = {}): Contract => ({
    id: 'test-id',
    name: 'Test',
    category: 'subscription',
    billingCycle: 'monthly',
    amount: 1000,
    renewalDate: new Date().toISOString(),
    reminderDays: 7,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  });

  it('should render title', () => {
    const { getByText } = render(<SummaryCard contracts={[]} />);
    expect(getByText('💰 年間費用サマリー')).toBeTruthy();
  });

  it('should display total annual cost', () => {
    const contracts = [
      createContract({ id: '1', billingCycle: 'monthly', amount: 10000 }),
    ];
    const { getByTestId } = render(<SummaryCard contracts={contracts} />);
    expect(getByTestId('total-annual')).toHaveTextContent('¥120,000');
  });

  it('should display total monthly cost', () => {
    const contracts = [
      createContract({ id: '1', billingCycle: 'monthly', amount: 10000 }),
    ];
    const { getByTestId } = render(<SummaryCard contracts={contracts} />);
    expect(getByTestId('total-monthly')).toHaveTextContent('¥10,000');
  });

  it('should display category breakdown', () => {
    const contracts = [
      createContract({ id: '1', category: 'subscription', amount: 1000 }),
      createContract({ id: '2', category: 'insurance', billingCycle: 'yearly', amount: 50000 }),
    ];
    const { getByText } = render(<SummaryCard contracts={contracts} />);
    expect(getByText('サブスク')).toBeTruthy();
    expect(getByText('保険')).toBeTruthy();
  });

  it('should show contract count', () => {
    const contracts = [
      createContract({ id: '1' }),
      createContract({ id: '2' }),
    ];
    const { getByText } = render(<SummaryCard contracts={contracts} />);
    expect(getByText(/登録契約数.*2.*件/)).toBeTruthy();
  });

  it('should display multiple contracts', () => {
    const contracts = [
      createContract({ id: '1', name: 'Netflix', amount: 1500 }),
      createContract({ id: '2', name: 'Spotify', amount: 980 }),
    ];
    const { getByTestId } = render(<SummaryCard contracts={contracts} />);
    // (1500 + 980) * 12 = 29760
    expect(getByTestId('total-annual')).toHaveTextContent('¥29,760');
  });

  it('should handle zero costs gracefully', () => {
    const { getByTestId } = render(<SummaryCard contracts={[]} />);
    expect(getByTestId('total-annual')).toHaveTextContent('¥0');
  });
});
