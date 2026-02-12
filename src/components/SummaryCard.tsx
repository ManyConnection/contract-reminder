import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Contract, CATEGORY_LABELS, CATEGORY_EMOJIS, ContractCategory } from '../types';
import {
  calculateTotalAnnualCost,
  calculateTotalMonthlyCost,
  calculateCostByCategory,
} from '../utils';
import { formatCurrency } from '../utils';

interface SummaryCardProps {
  contracts: Contract[];
  testID?: string;
}

export function SummaryCard({ contracts, testID }: SummaryCardProps) {
  const totalAnnual = calculateTotalAnnualCost(contracts);
  const totalMonthly = calculateTotalMonthlyCost(contracts);
  const byCategory = calculateCostByCategory(contracts);

  const categories: ContractCategory[] = ['subscription', 'insurance', 'rental', 'other'];

  return (
    <View style={styles.container} testID={testID}>
      <Text style={styles.title}>💰 年間費用サマリー</Text>

      <View style={styles.totalSection}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>年間総額</Text>
          <Text style={styles.totalAmount} testID="total-annual">
            {formatCurrency(totalAnnual)}
          </Text>
        </View>
        <View style={styles.totalRow}>
          <Text style={styles.monthlyLabel}>月平均</Text>
          <Text style={styles.monthlyAmount} testID="total-monthly">
            {formatCurrency(totalMonthly)}
          </Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.categorySection}>
        {categories.map((category) => (
          <View key={category} style={styles.categoryRow}>
            <View style={styles.categoryInfo}>
              <Text style={styles.categoryEmoji}>
                {CATEGORY_EMOJIS[category]}
              </Text>
              <Text style={styles.categoryName}>
                {CATEGORY_LABELS[category]}
              </Text>
            </View>
            <Text
              style={styles.categoryAmount}
              testID={`category-${category}`}
            >
              {formatCurrency(byCategory[category])}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.contractCount}>
        <Text style={styles.countText}>
          登録契約数: {contracts.length}件
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: 16,
  },
  totalSection: {
    backgroundColor: '#4A90A4',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  totalAmount: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  monthlyLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 8,
  },
  monthlyAmount: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 12,
  },
  categorySection: {
    gap: 12,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    color: '#7F8C8D',
  },
  categoryAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
  },
  contractCount: {
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  countText: {
    fontSize: 12,
    color: '#95A5A6',
    textAlign: 'center',
  },
});
