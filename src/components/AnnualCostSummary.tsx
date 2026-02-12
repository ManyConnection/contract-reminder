import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Contract, CATEGORY_LABELS, CATEGORY_EMOJIS, ContractCategory } from '../types';
import { formatCurrency } from '../utils';

interface AnnualCostSummaryProps {
  contracts: Contract[];
  testID?: string;
}

interface CategoryData {
  category: ContractCategory;
  amount: number;
  percentage: number;
}

const CATEGORY_DISPLAY_EMOJIS: Record<ContractCategory, string> = {
  subscription: '📺',
  insurance: '🛡️',
  rental: '🏠',
  other: '📋',
};

export function AnnualCostSummary({ contracts, testID }: AnnualCostSummaryProps) {
  // Calculate total annual cost (assuming all amounts are annual for simplicity)
  const totalCost = contracts.reduce((sum, contract) => sum + contract.amount, 0);
  const monthlyAverage = Math.round(totalCost / 12);

  // Calculate costs by category
  const costByCategory = contracts.reduce<Record<ContractCategory, number>>(
    (acc, contract) => {
      acc[contract.category] = (acc[contract.category] || 0) + contract.amount;
      return acc;
    },
    { subscription: 0, insurance: 0, rental: 0, other: 0 }
  );

  // Sort categories by amount descending, filtering out zero amounts
  const categoryData: CategoryData[] = Object.entries(costByCategory)
    .filter(([_, amount]) => amount > 0)
    .map(([category, amount]) => ({
      category: category as ContractCategory,
      amount,
      percentage: totalCost > 0 ? Math.round((amount / totalCost) * 100) : 0,
    }))
    .sort((a, b) => b.amount - a.amount);

  const isEmpty = contracts.length === 0;

  return (
    <View style={styles.container} testID={testID}>
      <Text style={styles.title}>年間契約費用</Text>

      <Text style={styles.totalAmount} testID="total-cost">
        {formatCurrency(totalCost)}
      </Text>

      {!isEmpty && (
        <Text style={styles.monthlyAverage}>月平均: {formatCurrency(monthlyAverage)}</Text>
      )}

      {isEmpty ? (
        <Text style={styles.emptyMessage}>契約を追加して費用を管理しましょう</Text>
      ) : (
        <View style={styles.categorySection}>
          <Text style={styles.sectionTitle}>カテゴリ別内訳</Text>
          {categoryData.map(({ category, amount, percentage }) => (
            <View key={category} style={styles.categoryRow}>
              <View style={styles.categoryInfo}>
                <Text style={styles.categoryEmoji}>
                  {CATEGORY_DISPLAY_EMOJIS[category]}
                </Text>
                <Text style={styles.categoryName}>
                  {CATEGORY_LABELS[category]}
                </Text>
              </View>
              <View style={styles.categoryValues}>
                <Text style={styles.categoryAmount}>{formatCurrency(amount)}</Text>
                <Text style={styles.categoryPercentage}>{percentage}%</Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#7F8C8D',
    marginBottom: 8,
    textAlign: 'center',
  },
  totalAmount: {
    fontSize: 36,
    fontWeight: '700',
    color: '#2C3E50',
    textAlign: 'center',
    marginBottom: 4,
  },
  monthlyAverage: {
    fontSize: 14,
    color: '#95A5A6',
    textAlign: 'center',
    marginBottom: 20,
  },
  emptyMessage: {
    fontSize: 14,
    color: '#95A5A6',
    textAlign: 'center',
    marginTop: 8,
  },
  categorySection: {
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingTop: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7F8C8D',
    marginBottom: 12,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryEmoji: {
    fontSize: 18,
    marginRight: 8,
  },
  categoryName: {
    fontSize: 14,
    color: '#2C3E50',
  },
  categoryValues: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
    marginRight: 12,
  },
  categoryPercentage: {
    fontSize: 12,
    color: '#95A5A6',
    minWidth: 40,
    textAlign: 'right',
  },
});
