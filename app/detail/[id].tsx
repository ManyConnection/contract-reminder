import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Contract, CATEGORY_LABELS, CATEGORY_EMOJIS, BILLING_CYCLE_LABELS } from '../../src/types';
import { getContract, deleteContract } from '../../src/services/storage';
import { cancelContractReminder } from '../../src/services/notifications';
import {
  formatCurrency,
  formatDateWithDay,
  formatRelativeDate,
  getUrgencyLevel,
  getDaysUntilRenewal,
  calculateAnnualCost,
  calculateMonthlyCost,
} from '../../src/utils';

export default function ContractDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [contract, setContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadContract();
  }, [id]);

  const loadContract = async () => {
    if (!id) {
      router.back();
      return;
    }

    const data = await getContract(id);
    if (!data) {
      Alert.alert('エラー', '契約が見つかりませんでした。');
      router.back();
      return;
    }

    setContract(data);
    setLoading(false);
  };

  const handleEdit = () => {
    if (contract) {
      router.push(`/edit/${contract.id}`);
    }
  };

  const handleDelete = () => {
    if (!contract) return;

    Alert.alert(
      '削除の確認',
      `「${contract.name}」を削除しますか？この操作は取り消せません。`,
      [
        {
          text: 'キャンセル',
          style: 'cancel',
        },
        {
          text: '削除',
          style: 'destructive',
          onPress: async () => {
            if (contract.notificationId) {
              await cancelContractReminder(contract.notificationId);
            }
            await deleteContract(contract.id);
            router.back();
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer} testID="detail-loading">
        <ActivityIndicator size="large" color="#4A90A4" />
        <Text style={styles.loadingText}>読み込み中...</Text>
      </View>
    );
  }

  if (!contract) {
    return null;
  }

  const daysUntil = getDaysUntilRenewal(contract);
  const urgency = getUrgencyLevel(daysUntil);
  const annualCost = calculateAnnualCost(contract);
  const monthlyCost = calculateMonthlyCost(contract);

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
    <View style={styles.container} testID="detail-screen">
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.emoji}>{CATEGORY_EMOJIS[contract.category]}</Text>
          <Text style={styles.name}>{contract.name}</Text>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>
              {CATEGORY_LABELS[contract.category]}
            </Text>
          </View>
        </View>

        {/* Renewal Status */}
        <View style={[styles.statusCard, { borderColor: getUrgencyColor() }]}>
          <Text style={styles.statusLabel}>更新日まで</Text>
          <Text style={[styles.statusValue, { color: getUrgencyColor() }]}>
            {formatRelativeDate(contract.renewalDate)}
          </Text>
          <Text style={styles.statusDate}>
            {formatDateWithDay(contract.renewalDate)}
          </Text>
        </View>

        {/* Cost Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💰 費用</Text>
          <View style={styles.row}>
            <Text style={styles.label}>
              {BILLING_CYCLE_LABELS[contract.billingCycle]}
            </Text>
            <Text style={styles.value} testID="detail-amount">
              {formatCurrency(contract.amount)}
            </Text>
          </View>
          {contract.billingCycle === 'monthly' && (
            <View style={styles.row}>
              <Text style={styles.label}>年間費用</Text>
              <Text style={styles.value} testID="detail-annual">
                {formatCurrency(annualCost)}
              </Text>
            </View>
          )}
          {contract.billingCycle === 'yearly' && (
            <View style={styles.row}>
              <Text style={styles.label}>月平均</Text>
              <Text style={styles.value} testID="detail-monthly">
                {formatCurrency(monthlyCost)}
              </Text>
            </View>
          )}
        </View>

        {/* Reminder */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔔 リマインダー</Text>
          <View style={styles.row}>
            <Text style={styles.label}>通知タイミング</Text>
            <Text style={styles.value} testID="detail-reminder">
              更新日の{contract.reminderDays}日前
            </Text>
          </View>
        </View>

        {/* Notes */}
        {contract.notes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📝 メモ</Text>
            <Text style={styles.notes} testID="detail-notes">
              {contract.notes}
            </Text>
          </View>
        )}

        {/* Metadata */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📋 情報</Text>
          <View style={styles.row}>
            <Text style={styles.label}>登録日</Text>
            <Text style={styles.metaValue}>
              {formatDateWithDay(contract.createdAt)}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>最終更新</Text>
            <Text style={styles.metaValue}>
              {formatDateWithDay(contract.updatedAt)}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={handleEdit}
          testID="edit-button"
        >
          <Ionicons name="pencil" size={20} color="#4A90A4" />
          <Text style={styles.editButtonText}>編集</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={handleDelete}
          testID="delete-button"
        >
          <Ionicons name="trash" size={20} color="#E74C3C" />
          <Text style={styles.deleteButtonText}>削除</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#7F8C8D',
  },
  content: {
    padding: 16,
    paddingBottom: 100,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  emoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: 8,
    textAlign: 'center',
  },
  categoryBadge: {
    backgroundColor: '#E8F4F8',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
  },
  categoryText: {
    fontSize: 14,
    color: '#4A90A4',
    fontWeight: '600',
  },
  statusCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
  },
  statusLabel: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 4,
  },
  statusValue: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 4,
  },
  statusDate: {
    fontSize: 14,
    color: '#95A5A6',
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  label: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  value: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
  },
  metaValue: {
    fontSize: 14,
    color: '#95A5A6',
  },
  notes: {
    fontSize: 14,
    color: '#2C3E50',
    lineHeight: 22,
  },
  actions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    gap: 12,
  },
  editButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E8F4F8',
    padding: 14,
    borderRadius: 8,
    gap: 8,
  },
  editButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4A90A4',
  },
  deleteButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FDEDEC',
    padding: 14,
    borderRadius: 8,
    gap: 8,
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E74C3C',
  },
});
