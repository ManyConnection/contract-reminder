import React, { useCallback } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity, Text, Alert, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { ContractCard, EmptyState } from '../../src/components';
import { useContracts } from '../../src/hooks';
import { Contract } from '../../src/types';

export default function ContractListScreen() {
  const router = useRouter();
  const { 
    contracts, 
    loading, 
    error, 
    deleteContract, 
    refreshContracts,
    getContractsSortedByRenewal,
  } = useContracts();

  const sortedContracts = getContractsSortedByRenewal();

  const handleAddPress = useCallback(() => {
    router.push('/add');
  }, [router]);

  const handleContractPress = useCallback((contract: Contract) => {
    router.push(`/edit/${contract.id}`);
  }, [router]);

  const handleDeletePress = useCallback((contract: Contract) => {
    Alert.alert(
      '契約を削除',
      `「${contract.name}」を削除してもよろしいですか？`,
      [
        { text: 'キャンセル', style: 'cancel' },
        { 
          text: '削除', 
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteContract(contract.id);
            } catch (err) {
              Alert.alert('エラー', '削除に失敗しました');
            }
          }
        },
      ]
    );
  }, [deleteContract]);

  const renderItem = useCallback(({ item }: { item: Contract }) => (
    <ContractCard
      contract={item}
      onPress={() => handleContractPress(item)}
      onDelete={() => handleDeletePress(item)}
    />
  ), [handleContractPress, handleDeletePress]);

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity 
          style={styles.retryButton} 
          onPress={refreshContracts}
          testID="retry-button"
        >
          <Text style={styles.retryButtonText}>再読み込み</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {sortedContracts.length === 0 && !loading ? (
        <EmptyState
          title="契約がありません"
          description="契約を追加して、更新日のリマインダーを受け取りましょう"
          actionLabel="契約を追加"
          onAction={handleAddPress}
        />
      ) : (
        <FlatList
          data={sortedContracts}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={refreshContracts}
            />
          }
          testID="contract-list"
        />
      )}
      
      {sortedContracts.length > 0 && (
        <TouchableOpacity
          style={styles.fab}
          onPress={handleAddPress}
          testID="add-button"
          accessibilityLabel="契約を追加"
        >
          <Text style={styles.fabText}>＋</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  listContent: {
    paddingVertical: 8,
    paddingBottom: 80,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#4A90A4',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },
  fabText: {
    fontSize: 28,
    color: '#fff',
    fontWeight: '300',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#E74C3C',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#4A90A4',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
