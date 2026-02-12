import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ContractCard } from '../../src/components/ContractCard';
import { Contract } from '../../src/types';

const createContract = (overrides: Partial<Contract> = {}): Contract => ({
  id: 'test-id',
  name: 'Test Contract',
  category: 'subscription',
  billingCycle: 'monthly',
  amount: 1000,
  renewalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  reminderDays: 7,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

describe('ContractCard', () => {
  const mockOnPress = jest.fn();
  const mockOnLongPress = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render contract name', () => {
    const contract = createContract({ name: 'Netflix' });
    const { getByText } = render(
      <ContractCard contract={contract} onPress={mockOnPress} />
    );
    expect(getByText('Netflix')).toBeTruthy();
  });

  it('should render contract amount', () => {
    const contract = createContract({ amount: 1500 });
    const { getByText } = render(
      <ContractCard contract={contract} onPress={mockOnPress} />
    );
    expect(getByText(/¥1,500/)).toBeTruthy();
  });

  it('should render category badge', () => {
    const contract = createContract({ category: 'subscription' });
    const { getByText } = render(
      <ContractCard contract={contract} onPress={mockOnPress} />
    );
    expect(getByText('サブスク')).toBeTruthy();
  });

  it('should render category emoji', () => {
    const contract = createContract({ category: 'insurance' });
    const { getByText } = render(
      <ContractCard contract={contract} onPress={mockOnPress} />
    );
    expect(getByText('🛡️')).toBeTruthy();
  });

  it('should call onPress when pressed', () => {
    const contract = createContract();
    const { getByTestId } = render(
      <ContractCard
        contract={contract}
        onPress={mockOnPress}
        testID="card"
      />
    );
    fireEvent.press(getByTestId('card'));
    expect(mockOnPress).toHaveBeenCalledWith(contract);
  });

  it('should call onLongPress when long pressed', () => {
    const contract = createContract();
    const { getByTestId } = render(
      <ContractCard
        contract={contract}
        onPress={mockOnPress}
        onLongPress={mockOnLongPress}
        testID="card"
      />
    );
    fireEvent(getByTestId('card'), 'longPress');
    expect(mockOnLongPress).toHaveBeenCalledWith(contract);
  });

  it('should show annual cost for monthly contracts', () => {
    const contract = createContract({ billingCycle: 'monthly', amount: 1000 });
    const { getByText } = render(
      <ContractCard contract={contract} onPress={mockOnPress} />
    );
    expect(getByText('¥12,000')).toBeTruthy();
  });

  it('should render renewal date', () => {
    const renewalDate = new Date(2024, 11, 25);
    const contract = createContract({ renewalDate: renewalDate.toISOString() });
    const { getByText } = render(
      <ContractCard contract={contract} onPress={mockOnPress} />
    );
    expect(getByText('2024年12月25日')).toBeTruthy();
  });

  it('should have accessible role', () => {
    const contract = createContract();
    const { getByRole } = render(
      <ContractCard contract={contract} onPress={mockOnPress} />
    );
    expect(getByRole('button')).toBeTruthy();
  });
});
