import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { CategoryFilter } from '../../src/components/CategoryFilter';

describe('CategoryFilter', () => {
  const mockOnSelectCategory = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render all category options', () => {
    const { getByTestId } = render(
      <CategoryFilter
        selectedCategory="all"
        onSelectCategory={mockOnSelectCategory}
        testID="filter"
      />
    );
    expect(getByTestId('filter-all')).toBeTruthy();
    expect(getByTestId('filter-subscription')).toBeTruthy();
    expect(getByTestId('filter-insurance')).toBeTruthy();
    expect(getByTestId('filter-rental')).toBeTruthy();
    expect(getByTestId('filter-other')).toBeTruthy();
  });

  it('should show category labels', () => {
    const { getByText } = render(
      <CategoryFilter
        selectedCategory="all"
        onSelectCategory={mockOnSelectCategory}
      />
    );
    expect(getByText('全て')).toBeTruthy();
    expect(getByText('サブスク')).toBeTruthy();
    expect(getByText('保険')).toBeTruthy();
    expect(getByText('賃貸')).toBeTruthy();
    expect(getByText('その他')).toBeTruthy();
  });

  it('should call onSelectCategory when category is pressed', () => {
    const { getByTestId } = render(
      <CategoryFilter
        selectedCategory="all"
        onSelectCategory={mockOnSelectCategory}
        testID="filter"
      />
    );
    fireEvent.press(getByTestId('filter-subscription'));
    expect(mockOnSelectCategory).toHaveBeenCalledWith('subscription');
  });

  it('should call onSelectCategory with all when all is pressed', () => {
    const { getByTestId } = render(
      <CategoryFilter
        selectedCategory="subscription"
        onSelectCategory={mockOnSelectCategory}
        testID="filter"
      />
    );
    fireEvent.press(getByTestId('filter-all'));
    expect(mockOnSelectCategory).toHaveBeenCalledWith('all');
  });

  it('should show category emojis', () => {
    const { getAllByText } = render(
      <CategoryFilter
        selectedCategory="all"
        onSelectCategory={mockOnSelectCategory}
      />
    );
    expect(getAllByText('📋').length).toBeGreaterThan(0);
    expect(getAllByText('📱').length).toBeGreaterThan(0);
    expect(getAllByText('🛡️').length).toBeGreaterThan(0);
    expect(getAllByText('🏠').length).toBeGreaterThan(0);
  });

  it('should have accessible role for buttons', () => {
    const { getByTestId } = render(
      <CategoryFilter
        selectedCategory="all"
        onSelectCategory={mockOnSelectCategory}
        testID="filter"
      />
    );
    expect(getByTestId('filter-all')).toHaveProp('accessibilityRole', 'button');
  });

  it('should indicate selected state in accessibility', () => {
    const { getByTestId } = render(
      <CategoryFilter
        selectedCategory="insurance"
        onSelectCategory={mockOnSelectCategory}
        testID="filter"
      />
    );
    expect(getByTestId('filter-insurance')).toHaveProp('accessibilityState', { selected: true });
    expect(getByTestId('filter-all')).toHaveProp('accessibilityState', { selected: false });
  });
});
