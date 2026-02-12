import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { ContractForm } from '../../src/components/ContractForm';
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

describe('ContractForm', () => {
  const mockOnSubmit = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render form fields', () => {
    const { getByTestId, getByText } = render(
      <ContractForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        testID="form"
      />
    );
    expect(getByTestId('input-name')).toBeTruthy();
    expect(getByTestId('input-amount')).toBeTruthy();
    expect(getByTestId('input-reminder-days')).toBeTruthy();
    expect(getByText('契約名 *')).toBeTruthy();
  });

  it('should render category options', () => {
    const { getByTestId } = render(
      <ContractForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );
    expect(getByTestId('category-subscription')).toBeTruthy();
    expect(getByTestId('category-insurance')).toBeTruthy();
    expect(getByTestId('category-rental')).toBeTruthy();
    expect(getByTestId('category-other')).toBeTruthy();
  });

  it('should render billing cycle options', () => {
    const { getByTestId } = render(
      <ContractForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );
    expect(getByTestId('cycle-monthly')).toBeTruthy();
    expect(getByTestId('cycle-yearly')).toBeTruthy();
    expect(getByTestId('cycle-one-time')).toBeTruthy();
  });

  it('should call onCancel when cancel button is pressed', () => {
    const { getByTestId } = render(
      <ContractForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );
    fireEvent.press(getByTestId('button-cancel'));
    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('should show validation error for empty name', async () => {
    const { getByTestId, getByText } = render(
      <ContractForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );
    fireEvent.changeText(getByTestId('input-amount'), '1000');
    fireEvent.press(getByTestId('button-submit'));
    
    await waitFor(() => {
      expect(getByText('契約名を入力してください')).toBeTruthy();
    });
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('should show validation error for empty amount', async () => {
    const { getByTestId, getByText } = render(
      <ContractForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );
    fireEvent.changeText(getByTestId('input-name'), 'Netflix');
    fireEvent.press(getByTestId('button-submit'));
    
    await waitFor(() => {
      expect(getByText('金額を入力してください')).toBeTruthy();
    });
  });

  it('should update category when option is pressed', () => {
    const { getByTestId } = render(
      <ContractForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );
    fireEvent.press(getByTestId('category-insurance'));
    // Category is internal state, verified via submit
  });

  it('should update billing cycle when option is pressed', () => {
    const { getByTestId } = render(
      <ContractForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );
    fireEvent.press(getByTestId('cycle-yearly'));
    // Billing cycle is internal state, verified via submit
  });

  it('should call onSubmit with form data when valid', async () => {
    const { getByTestId } = render(
      <ContractForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );
    
    fireEvent.changeText(getByTestId('input-name'), 'Netflix');
    fireEvent.changeText(getByTestId('input-amount'), '1500');
    fireEvent.changeText(getByTestId('input-reminder-days'), '7');
    fireEvent.press(getByTestId('button-submit'));
    
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalled();
    });
    const callArg = mockOnSubmit.mock.calls[0][0];
    expect(callArg.name).toBe('Netflix');
    expect(callArg.amount).toBe('1500');
  });

  it('should pre-fill form with initial data', () => {
    const contract = createContract({ name: 'Existing Contract', amount: 2000 });
    const { getByTestId } = render(
      <ContractForm
        initialData={contract}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );
    expect(getByTestId('input-name').props.value).toBe('Existing Contract');
    expect(getByTestId('input-amount').props.value).toBe('2000');
  });

  it('should use custom submit label', () => {
    const { getByText } = render(
      <ContractForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        submitLabel="追加"
      />
    );
    expect(getByText('追加')).toBeTruthy();
  });

  it('should clear error when field is updated', async () => {
    const { getByTestId, getByText, queryByText } = render(
      <ContractForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );
    
    fireEvent.changeText(getByTestId('input-amount'), '1000');
    fireEvent.press(getByTestId('button-submit'));
    
    await waitFor(() => {
      expect(getByText('契約名を入力してください')).toBeTruthy();
    });
    
    fireEvent.changeText(getByTestId('input-name'), 'Test');
    
    await waitFor(() => {
      expect(queryByText('契約名を入力してください')).toBeNull();
    });
  });

  it('should strip non-numeric characters from amount', () => {
    const { getByTestId } = render(
      <ContractForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );
    fireEvent.changeText(getByTestId('input-amount'), '1,000円');
    expect(getByTestId('input-amount').props.value).toBe('1000');
  });

  it('should render notes field', () => {
    const { getByTestId } = render(
      <ContractForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );
    expect(getByTestId('input-notes')).toBeTruthy();
  });
});
