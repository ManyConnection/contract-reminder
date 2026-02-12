import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ContractCard } from '../../components/ContractCard';
import { Contract } from '../../types';

describe('ContractCard', () => {
  const createContract = (overrides: Partial<Contract> = {}): Contract => ({
    id: 'test-id-1',
    name: 'Netflix',
    category: 'subscription',
    billingCycle: 'monthly',
    amount: 1500,
    renewalDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
    reminderDays: 7,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    ...overrides,
  });

  const mockOnPress = jest.fn();
  const mockOnDelete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render contract name', () => {
    const { getByText } = render(
      <ContractCard contract={createContract()} onPress={mockOnPress} onDelete={mockOnDelete} />
    );
    expect(getByText('Netflix')).toBeTruthy();
  });

  it('should render contract amount in yen format', () => {
    const { getByText } = render(
      <ContractCard contract={createContract()} onPress={mockOnPress} onDelete={mockOnDelete} />
    );
    expect(getByText(/¥1,500/)).toBeTruthy();
  });

  it('should render category label', () => {
    const { getByText } = render(
      <ContractCard contract={createContract()} onPress={mockOnPress} onDelete={mockOnDelete} />
    );
    expect(getByText('サブスク')).toBeTruthy();
  });

  it('should call onPress when card is pressed', () => {
    const contract = createContract();
    const { getByTestId } = render(
      <ContractCard contract={contract} onPress={mockOnPress} testID="contract-card" />
    );
    fireEvent.press(getByTestId('contract-card'));
    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  it('should call onPress with contract argument', () => {
    const contract = createContract();
    const { getByTestId } = render(
      <ContractCard contract={contract} onPress={mockOnPress} testID="contract-card" />
    );
    fireEvent.press(getByTestId('contract-card'));
    expect(mockOnPress).toHaveBeenCalledWith(contract);
  });

  it('should show different category for insurance', () => {
    const { getByText } = render(
      <ContractCard 
        contract={createContract({ category: 'insurance' })} 
        onPress={mockOnPress} 
        onDelete={mockOnDelete} 
      />
    );
    expect(getByText('保険')).toBeTruthy();
  });

  it('should show different category for rental', () => {
    const { getByText } = render(
      <ContractCard 
        contract={createContract({ category: 'rental' })} 
        onPress={mockOnPress} 
        onDelete={mockOnDelete} 
      />
    );
    expect(getByText('賃貸')).toBeTruthy();
  });

  it('should show yearly billing format', () => {
    const { getByText } = render(
      <ContractCard 
        contract={createContract({ billingCycle: 'yearly', amount: 10000 })} 
        onPress={mockOnPress} 
      />
    );
    // Component renders "¥10,000" and "/ 年" as separate text elements
    expect(getByText(/¥10,000/)).toBeTruthy();
    expect(getByText(/\/ 年/)).toBeTruthy();
  });

  it('should display formatted renewal date', () => {
    const contract = createContract({ renewalDate: '2024-12-25T00:00:00.000Z' });
    const { getByText } = render(
      <ContractCard contract={contract} onPress={mockOnPress} onDelete={mockOnDelete} />
    );
    expect(getByText(/12月25日/)).toBeTruthy();
  });
});
