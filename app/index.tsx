import React, { useState, useCallback } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Contract, ContractCategory } from '../src/types';
import { getContracts, deleteContract } from '../src/services/storage';
import { cancelContractReminder } from '../src/services/notifications';
import {
  ContractCard,
  SummaryCard,
  CategoryFilter,
  EmptyState,
} from '../src/components';
import {
  filterByCategory,
  sortByRenewalDate,
} from '../src/utils';

export default function HomeScreen() {
  const router = useRouter();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<ContractCategory | 'all'>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [showSummary, setShowSummary] = useState(true);

  const loadContracts = async () => {
    const data = await getContracts();
    setContracts(data);
  };

  useFocusEffect(
    useCallback(() => {
      loadContracts();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadContracts();
    setRefreshing(false);
  };

  const handleContractPress = (contract: Contract) => {
    router.push(`/detail/${contract.id}`);
  };

  const handleContractLongPress = (contract: Contract) => {
    Alert.alert(
      contract.name,
      'この契約をどうしますか？',
      [
        {
          text: '編集',
          onPress: () => router.push(`/edit/${contract.id}`),
        },
        {
          text: '削除',
          style: 'destructive',
          onPress: () => confirmDelete(contract),
        },
        {
          text: 'キャンセル',
          style: 'cancel',
        },
      ]
    );
  };

  const confirmDelete = (contract: Contract) => {
    Alert.alert(
      '削除の確認',
      `「${contract.name}」を削除しますか？`,
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
            await loadContracts();
          },
        },
      ]
    );
  };

  const filteredContracts = selectedCategory === 'all'
    ? contracts
    : filterByCategory(contracts, selectedCategory);

  const sortedContracts = sortByRenewalDate(filteredContracts);

  const renderItem = ({ item }: { item: Contract }) => (
    <ContractCard
      contract={item}
      onPress={handleContractPress}
      onLongPress={handleContractLongPress}
      testID={`contract-card-${item.id}`}
    />
  );

  const renderHeader = () => (
    <>
      {showSummary && contracts.length > 0 && (
        <SummaryCard contracts={contracts} testID="summary-card" />
      )}
      <CategoryFilter
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        testID="category-filter"
      />
    </>
  );

  const renderEmpty = () => (
    <EmptyState
      emoji="📝"
      title="契約がありません"
      description="サブスク、保険、賃貸などの契約を登録して、更新日を管理しましょう。"
      actionLabel="契約を追加"
      onAction={() => router.push('/add')}
      testID="empty-state"
    />
  );

  return (
    <View style={styles.container} testID="home-screen">
      {contracts.length === 0 ? (
        renderEmpty()
      ) : (
        <FlatList
          data={sortedContracts}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/add')}
        testID="add-button"
        accessibilityRole="button"
        accessibilityLabel="契約を追加"
      >
        <Ionicons name="add" size={28} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  listContent: {
    paddingBottom: 100,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#4A90A4',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
});
