import React, { useState } from 'react';
import { View, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { ContractForm } from '../src/components';
import { useContracts } from '../src/hooks';
import { ContractFormData } from '../src/types';

export default function AddContractScreen() {
  const router = useRouter();
  const { addContract } = useContracts();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (data: ContractFormData) => {
    try {
      setSubmitting(true);
      await addContract(data);
      router.back();
    } catch (error) {
      Alert.alert('エラー', '契約の追加に失敗しました');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  if (submitting) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4A90A4" />
      </View>
    );
  }

  return (
    <View style={styles.container} testID="add-contract-screen">
      <ContractForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        submitLabel="追加"
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
});
