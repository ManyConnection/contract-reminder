import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { EmptyState } from '../../src/components/EmptyState';

describe('EmptyState', () => {
  const mockOnAction = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render title', () => {
    const { getByText } = render(
      <EmptyState
        title="No Items"
        description="There are no items to display"
      />
    );
    expect(getByText('No Items')).toBeTruthy();
  });

  it('should render description', () => {
    const { getByText } = render(
      <EmptyState
        title="No Items"
        description="There are no items to display"
      />
    );
    expect(getByText('There are no items to display')).toBeTruthy();
  });

  it('should render default emoji', () => {
    const { getByText } = render(
      <EmptyState
        title="No Items"
        description="Description"
      />
    );
    expect(getByText('📝')).toBeTruthy();
  });

  it('should render custom emoji', () => {
    const { getByText } = render(
      <EmptyState
        title="No Items"
        description="Description"
        emoji="🎉"
      />
    );
    expect(getByText('🎉')).toBeTruthy();
  });

  it('should render action button when actionLabel and onAction are provided', () => {
    const { getByText } = render(
      <EmptyState
        title="No Items"
        description="Description"
        actionLabel="Add Item"
        onAction={mockOnAction}
      />
    );
    expect(getByText('Add Item')).toBeTruthy();
  });

  it('should not render action button when only actionLabel is provided', () => {
    const { queryByText } = render(
      <EmptyState
        title="No Items"
        description="Description"
        actionLabel="Add Item"
      />
    );
    expect(queryByText('Add Item')).toBeNull();
  });

  it('should not render action button when only onAction is provided', () => {
    const { queryByTestId } = render(
      <EmptyState
        title="No Items"
        description="Description"
        onAction={mockOnAction}
        testID="empty"
      />
    );
    expect(queryByTestId('empty-action')).toBeNull();
  });

  it('should call onAction when button is pressed', () => {
    const { getByTestId } = render(
      <EmptyState
        title="No Items"
        description="Description"
        actionLabel="Add Item"
        onAction={mockOnAction}
        testID="empty"
      />
    );
    fireEvent.press(getByTestId('empty-action'));
    expect(mockOnAction).toHaveBeenCalled();
  });

  it('should have accessible role for action button', () => {
    const { getByTestId } = render(
      <EmptyState
        title="No Items"
        description="Description"
        actionLabel="Add Item"
        onAction={mockOnAction}
        testID="empty"
      />
    );
    expect(getByTestId('empty-action')).toHaveProp('accessibilityRole', 'button');
  });
});
