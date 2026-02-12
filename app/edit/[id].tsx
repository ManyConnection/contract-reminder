import React, { useState } from 'react';
import { View, StyleSheet, Alert, ActivityIndicator, Text } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ContractForm } from '../../src/components';
import { useContracts } from '../../src/hooks';
import { ContractFormData, DEFAULT_REMINDER_DAYS } from '../../src/types';

export default function EditContractScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { contracts, updateContract, loading } = useContracts();
  const [submitting, setSubmitting] = useState(false);

  const contract = contracts.find(c => c.id === id);

  const handleSubmit = async (data: ContractFormData) => {
    if (!id) return;
    
    try {
      setSubmitting(true);
      await updateContract(id, data);
      router.back();
    } catch (error) {
      Alert.alert('エラー', '契約の更新に失敗しました');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  if (loading || submitting) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4A90A4" />
      </View>
    );
  }

  if (!contract) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>契約が見つかりません</Text>
      </View>
    );
  }

  return (
    <View style={styles.container} testID="edit-contract-screen">
      <ContractForm
        initialData={contract}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        submitLabel="更新"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
  },
  errorText: {
    fontSize: 16,
    color: '#E74C3C',
  },
});
