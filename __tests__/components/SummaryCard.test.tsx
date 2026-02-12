import React from 'react';
import { render } from '@testing-library/react-native';
import { SummaryCard } from '../../src/components/SummaryCard';
import { Contract } from '../../src/types';

const createContract = (overrides: Partial<Contract> = {}): Contract => ({
  id: 'test-id',
  name: 'Test Contract',
  category: 'subscription',
  billingCycle: 'monthly',
  amount: 1000,
  renewalDate: new Date().toISOString(),
  reminderDays: 7,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

describe('SummaryCard', () => {
  it('should render title', () => {
    const { getByText } = render(<SummaryCard contracts={[]} />);
    expect(getByText('💰 年間費用サマリー')).toBeTruthy();
  });

  it('should show zero totals for empty contracts', () => {
    const { getByTestId } = render(
      <SummaryCard contracts={[]} testID="summary" />
    );
    expect(getByTestId('total-annual')).toHaveTextContent('¥0');
    expect(getByTestId('total-monthly')).toHaveTextContent('¥0');
  });

  it('should calculate total annual cost', () => {
    const contracts = [
      createContract({ id: '1', billingCycle: 'monthly', amount: 1000 }),
      createContract({ id: '2', billingCycle: 'yearly', amount: 6000 }),
    ];
    const { getByTestId } = render(
      <SummaryCard contracts={contracts} testID="summary" />
    );
    expect(getByTestId('total-annual')).toHaveTextContent('¥18,000');
  });

  it('should calculate total monthly cost', () => {
    const contracts = [
      createContract({ id: '1', billingCycle: 'monthly', amount: 1000 }),
      createContract({ id: '2', billingCycle: 'monthly', amount: 500 }),
    ];
    const { getByTestId } = render(
      <SummaryCard contracts={contracts} testID="summary" />
    );
    expect(getByTestId('total-monthly')).toHaveTextContent('¥1,500');
  });

  it('should show costs by category', () => {
    const contracts = [
      createContract({ id: '1', category: 'subscription', amount: 1000 }),
      createContract({ id: '2', category: 'insurance', billingCycle: 'yearly', amount: 12000 }),
    ];
    const { getByTestId } = render(
      <SummaryCard contracts={contracts} testID="summary" />
    );
    expect(getByTestId('category-subscription')).toHaveTextContent('¥12,000');
    expect(getByTestId('category-insurance')).toHaveTextContent('¥12,000');
    expect(getByTestId('category-rental')).toHaveTextContent('¥0');
  });

  it('should show contract count', () => {
    const contracts = [
      createContract({ id: '1' }),
      createContract({ id: '2' }),
      createContract({ id: '3' }),
    ];
    const { getByText } = render(<SummaryCard contracts={contracts} />);
    expect(getByText('登録契約数: 3件')).toBeTruthy();
  });

  it('should show category emojis', () => {
    const { getByText } = render(<SummaryCard contracts={[]} />);
    expect(getByText('📱')).toBeTruthy();
    expect(getByText('🛡️')).toBeTruthy();
    expect(getByText('🏠')).toBeTruthy();
    expect(getByText('📋')).toBeTruthy();
  });
});
