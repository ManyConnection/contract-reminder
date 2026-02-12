import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { ContractCategory, CATEGORY_LABELS, CATEGORY_EMOJIS } from '../types';

interface CategoryFilterProps {
  selectedCategory: ContractCategory | 'all';
  onSelectCategory: (category: ContractCategory | 'all') => void;
  testID?: string;
}

export function CategoryFilter({
  selectedCategory,
  onSelectCategory,
  testID,
}: CategoryFilterProps) {
  const categories: (ContractCategory | 'all')[] = [
    'all',
    'subscription',
    'insurance',
    'rental',
    'other',
  ];

  const getLabel = (category: ContractCategory | 'all') => {
    if (category === 'all') return '全て';
    return CATEGORY_LABELS[category];
  };

  const getEmoji = (category: ContractCategory | 'all') => {
    if (category === 'all') return '📋';
    return CATEGORY_EMOJIS[category];
  };

  return (
    <View style={styles.container} testID={testID}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.chip,
              selectedCategory === category && styles.chipSelected,
            ]}
            onPress={() => onSelectCategory(category)}
            testID={`filter-${category}`}
            accessibilityRole="button"
            accessibilityState={{ selected: selectedCategory === category }}
          >
            <Text style={styles.emoji}>{getEmoji(category)}</Text>
            <Text
              style={[
                styles.label,
                selectedCategory === category && styles.labelSelected,
              ]}
            >
              {getLabel(category)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  chipSelected: {
    backgroundColor: '#4A90A4',
  },
  emoji: {
    fontSize: 14,
    marginRight: 6,
  },
  label: {
    fontSize: 14,
    color: '#7F8C8D',
    fontWeight: '500',
  },
  labelSelected: {
    color: '#FFFFFF',
  },
});
