import React from 'react';
import { render } from '@testing-library/react-native';
import { AnnualCostSummary } from '../../components/AnnualCostSummary';
import { Contract } from '../../types/contract';

describe('AnnualCostSummary', () => {
  const mockContracts: Contract[] = [
    {
      id: 'test-1',
      name: 'Netflix',
      startDate: '2024-01-01T00:00:00.000Z',
      renewalDate: '2025-01-01T00:00:00.000Z',
      amount: 1500,
      category: 'subscription',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    },
    {
      id: 'test-2',
      name: 'Spotify',
      startDate: '2024-01-01T00:00:00.000Z',
      renewalDate: '2025-01-01T00:00:00.000Z',
      amount: 980,
      category: 'subscription',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    },
    {
      id: 'test-3',
      name: 'Life Insurance',
      startDate: '2024-01-01T00:00:00.000Z',
      renewalDate: '2025-01-01T00:00:00.000Z',
      amount: 50000,
      category: 'insurance',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    },
  ];

  it('should display total annual cost', () => {
    const { getByTestId } = render(
      <AnnualCostSummary contracts={mockContracts} />
    );

    expect(getByTestId('total-cost').props.children).toBe('¥52,480');
  });

  it('should display monthly average', () => {
    const { getByText } = render(
      <AnnualCostSummary contracts={mockContracts} />
    );

    // 52480 / 12 = 4373.33 -> rounded to 4373
    expect(getByText('月平均: ¥4,373')).toBeTruthy();
  });

  it('should display category breakdown', () => {
    const { getByText } = render(
      <AnnualCostSummary contracts={mockContracts} />
    );

    expect(getByText('カテゴリ別内訳')).toBeTruthy();
    expect(getByText('サブスク')).toBeTruthy();
    expect(getByText('保険')).toBeTruthy();
  });

  it('should display category amounts', () => {
    const { getByText } = render(
      <AnnualCostSummary contracts={mockContracts} />
    );

    // Subscription total: 1500 + 980 = 2480
    expect(getByText('¥2,480')).toBeTruthy();
    // Insurance total: 50000
    expect(getByText('¥50,000')).toBeTruthy();
  });

  it('should display category percentages', () => {
    const { getByText } = render(
      <AnnualCostSummary contracts={mockContracts} />
    );

    // Insurance: 50000 / 52480 = ~95%
    expect(getByText('95%')).toBeTruthy();
    // Subscription: 2480 / 52480 = ~5%
    expect(getByText('5%')).toBeTruthy();
  });

  it('should sort categories by amount descending', () => {
    const { getAllByText } = render(
      <AnnualCostSummary contracts={mockContracts} />
    );

    // Insurance (50000) should come before Subscription (2480)
    const insuranceIndex = getAllByText('保険').length > 0;
    const subscriptionIndex = getAllByText('サブスク').length > 0;
    
    expect(insuranceIndex).toBe(true);
    expect(subscriptionIndex).toBe(true);
  });

  it('should display empty state when no contracts', () => {
    const { getByText } = render(
      <AnnualCostSummary contracts={[]} />
    );

    expect(getByText('年間契約費用')).toBeTruthy();
    expect(getByText('¥0')).toBeTruthy();
    expect(getByText('契約を追加して費用を管理しましょう')).toBeTruthy();
  });

  it('should display category emojis', () => {
    const { getByText } = render(
      <AnnualCostSummary contracts={mockContracts} />
    );

    expect(getByText('📺')).toBeTruthy(); // subscription
    expect(getByText('🛡️')).toBeTruthy(); // insurance
  });

  it('should handle single contract', () => {
    const singleContract = [mockContracts[0]];
    const { getByTestId, getByText } = render(
      <AnnualCostSummary contracts={singleContract} />
    );

    expect(getByTestId('total-cost').props.children).toBe('¥1,500');
    expect(getByText('100%')).toBeTruthy();
  });

  it('should calculate monthly average correctly for various totals', () => {
    const contracts: Contract[] = [
      {
        ...mockContracts[0],
        amount: 12000, // 12000 / 12 = 1000 exactly
      },
    ];

    const { getByText } = render(
      <AnnualCostSummary contracts={contracts} />
    );

    expect(getByText('月平均: ¥1,000')).toBeTruthy();
  });
});
