import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import { Contract, CATEGORY_LABELS, CATEGORY_EMOJIS, BILLING_CYCLE_LABELS } from '../types';
import {
  formatCurrency,
  formatDate,
  formatRelativeDate,
  getUrgencyLevel,
} from '../utils';
import { getDaysUntilRenewal, calculateAnnualCost } from '../utils';

interface ContractCardProps {
  contract: Contract;
  onPress: (contract: Contract) => void;
  onLongPress?: (contract: Contract) => void;
  testID?: string;
}

export function ContractCard({
  contract,
  onPress,
  onLongPress,
  testID,
}: ContractCardProps) {
  const daysUntil = getDaysUntilRenewal(contract);
  const urgency = getUrgencyLevel(daysUntil);
  const annualCost = calculateAnnualCost(contract);

  const getUrgencyColor = () => {
    switch (urgency) {
      case 'urgent':
        return '#E74C3C';
      case 'warning':
        return '#F39C12';
      default:
        return '#27AE60';
    }
  };

  return (
    <Pressable
      style={[styles.card, { borderLeftColor: getUrgencyColor() }]}
      onPress={() => onPress(contract)}
      onLongPress={() => onLongPress?.(contract)}
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={`${contract.name}の契約詳細を表示`}
    >
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.emoji}>
            {CATEGORY_EMOJIS[contract.category]}
          </Text>
          <Text style={styles.name} numberOfLines={1}>
            {contract.name}
          </Text>
        </View>
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>
            {CATEGORY_LABELS[contract.category]}
          </Text>
        </View>
      </View>

      <View style={styles.body}>
        <View style={styles.row}>
          <Text style={styles.label}>金額</Text>
          <Text style={styles.amount}>
            {formatCurrency(contract.amount)}
            <Text style={styles.cycle}>
              {' '}/ {BILLING_CYCLE_LABELS[contract.billingCycle].replace('額', '')}
            </Text>
          </Text>
        </View>

        {contract.billingCycle === 'monthly' && (
          <View style={styles.row}>
            <Text style={styles.label}>年間</Text>
            <Text style={styles.annualAmount}>
              {formatCurrency(annualCost)}
            </Text>
          </View>
        )}

        <View style={styles.row}>
          <Text style={styles.label}>更新日</Text>
          <View style={styles.dateContainer}>
            <Text style={styles.date}>{formatDate(contract.renewalDate)}</Text>
            <Text style={[styles.relative, { color: getUrgencyColor() }]}>
              {formatRelativeDate(contract.renewalDate)}
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  emoji: {
    fontSize: 20,
    marginRight: 8,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    flex: 1,
  },
  categoryBadge: {
    backgroundColor: '#E8F4F8',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 12,
    color: '#4A90A4',
    fontWeight: '500',
  },
  body: {
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  amount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
  },
  cycle: {
    fontSize: 12,
    fontWeight: '400',
    color: '#95A5A6',
  },
  annualAmount: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  date: {
    fontSize: 14,
    color: '#2C3E50',
  },
  dateContainer: {
    alignItems: 'flex-end',
  },
  relative: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
});
