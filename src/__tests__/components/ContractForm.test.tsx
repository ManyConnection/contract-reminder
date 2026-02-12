import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { ContractForm } from '../../components/ContractForm';

// Mock DateTimePicker
jest.mock('@react-native-community/datetimepicker', () => {
  const React = require('react');
  return {
    __esModule: true,
    default: () => null,
  };
});

describe('ContractForm', () => {
  const mockOnSubmit = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render all form fields', () => {
    const { getByTestId } = render(
      <ContractForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
    );

    expect(getByTestId('input-name')).toBeTruthy();
    expect(getByTestId('input-amount')).toBeTruthy();
    expect(getByTestId('input-reminder-days')).toBeTruthy();
    expect(getByTestId('input-notes')).toBeTruthy();
  });

  it('should render category buttons', () => {
    const { getByTestId } = render(
      <ContractForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
    );

    expect(getByTestId('category-subscription')).toBeTruthy();
    expect(getByTestId('category-insurance')).toBeTruthy();
    expect(getByTestId('category-rental')).toBeTruthy();
    expect(getByTestId('category-other')).toBeTruthy();
  });

  it('should render billing cycle buttons', () => {
    const { getByTestId } = render(
      <ContractForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
    );

    expect(getByTestId('cycle-monthly')).toBeTruthy();
    expect(getByTestId('cycle-yearly')).toBeTruthy();
    expect(getByTestId('cycle-one-time')).toBeTruthy();
  });

  it('should call onCancel when cancel button is pressed', () => {
    const { getByTestId } = render(
      <ContractForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
    );

    fireEvent.press(getByTestId('button-cancel'));
    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });

  it('should show validation error for empty name', async () => {
    const { getByTestId, findByText } = render(
      <ContractForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
    );

    fireEvent.changeText(getByTestId('input-amount'), '1500');
    fireEvent.changeText(getByTestId('input-reminder-days'), '7');
    fireEvent.press(getByTestId('button-submit'));

    expect(await findByText('契約名を入力してください')).toBeTruthy();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('should show validation error for empty amount', async () => {
    const { getByTestId, findByText } = render(
      <ContractForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
    );

    fireEvent.changeText(getByTestId('input-name'), 'Netflix');
    fireEvent.changeText(getByTestId('input-reminder-days'), '7');
    fireEvent.press(getByTestId('button-submit'));

    expect(await findByText('金額を入力してください')).toBeTruthy();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('should call onSubmit with valid data', async () => {
    const { getByTestId } = render(
      <ContractForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
    );

    fireEvent.changeText(getByTestId('input-name'), 'Netflix');
    fireEvent.changeText(getByTestId('input-amount'), '1500');
    fireEvent.changeText(getByTestId('input-reminder-days'), '7');
    fireEvent.press(getByTestId('button-submit'));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledTimes(1);
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Netflix',
          amount: '1500',
          category: 'subscription',
          billingCycle: 'monthly',
        })
      );
    });
  });

  it('should allow selecting different categories', async () => {
    const { getByTestId } = render(
      <ContractForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
    );

    fireEvent.press(getByTestId('category-insurance'));
    fireEvent.changeText(getByTestId('input-name'), 'Health Insurance');
    fireEvent.changeText(getByTestId('input-amount'), '10000');
    fireEvent.changeText(getByTestId('input-reminder-days'), '30');
    fireEvent.press(getByTestId('button-submit'));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ category: 'insurance' })
      );
    });
  });

  it('should allow selecting different billing cycles', async () => {
    const { getByTestId } = render(
      <ContractForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
    );

    fireEvent.press(getByTestId('cycle-yearly'));
    fireEvent.changeText(getByTestId('input-name'), 'Domain');
    fireEvent.changeText(getByTestId('input-amount'), '5000');
    fireEvent.changeText(getByTestId('input-reminder-days'), '30');
    fireEvent.press(getByTestId('button-submit'));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ billingCycle: 'yearly' })
      );
    });
  });

  it('should use custom submit label', () => {
    const { getByText } = render(
      <ContractForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} submitLabel="追加" />
    );

    expect(getByText('追加')).toBeTruthy();
  });
});
