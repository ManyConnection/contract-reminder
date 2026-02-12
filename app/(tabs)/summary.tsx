import React from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { SummaryCard } from '../../src/components';
import { useContracts } from '../../src/hooks';

export default function SummaryScreen() {
  const { contracts, loading, refreshContracts, getAnnualCost, getMonthlyCost, getCostByCategory } = useContracts();

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={loading}
          onRefresh={refreshContracts}
        />
      }
      testID="summary-screen"
    >
      <SummaryCard 
        contracts={contracts}
        totalAnnualCost={getAnnualCost()}
        totalMonthlyCost={getMonthlyCost()}
        costByCategory={getCostByCategory()}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
});
