import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { EmptyState } from '../../components/EmptyState';

describe('EmptyState', () => {
  it('should render title and description', () => {
    const { getByText } = render(
      <EmptyState 
        title="No Data" 
        description="Add some data to get started" 
      />
    );

    expect(getByText('No Data')).toBeTruthy();
    expect(getByText('Add some data to get started')).toBeTruthy();
  });

  it('should render action button when provided', () => {
    const mockOnAction = jest.fn();
    const { getByText } = render(
      <EmptyState 
        title="No Data" 
        description="Add some data" 
        actionLabel="Add Item"
        onAction={mockOnAction}
      />
    );

    expect(getByText('Add Item')).toBeTruthy();
  });

  it('should not render action button when not provided', () => {
    const { queryByTestId } = render(
      <EmptyState 
        title="No Data" 
        description="Add some data" 
      />
    );

    expect(queryByTestId('empty-state-action')).toBeNull();
  });

  it('should call onAction when button is pressed', () => {
    const mockOnAction = jest.fn();
    const { getByTestId } = render(
      <EmptyState 
        title="No Data" 
        description="Add some data" 
        actionLabel="Add Item"
        onAction={mockOnAction}
        testID="empty-state"
      />
    );

    fireEvent.press(getByTestId('empty-state-action'));
    expect(mockOnAction).toHaveBeenCalledTimes(1);
  });

  it('should have correct testID', () => {
    const { getByTestId } = render(
      <EmptyState 
        title="No Data" 
        description="Add some data" 
        testID="empty-state"
      />
    );

    expect(getByTestId('empty-state')).toBeTruthy();
  });
});
