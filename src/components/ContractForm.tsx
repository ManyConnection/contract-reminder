import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
  Modal,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import {
  Contract,
  ContractFormData,
  ContractCategory,
  BillingCycle,
  CATEGORY_LABELS,
  CATEGORY_EMOJIS,
  BILLING_CYCLE_LABELS,
  DEFAULT_REMINDER_DAYS,
} from '../types';
import { validateContractForm, isValidForm, ValidationErrors } from '../utils';
import { formatDate } from '../utils';

interface ContractFormProps {
  initialData?: Contract;
  onSubmit: (data: ContractFormData) => void;
  onCancel: () => void;
  submitLabel?: string;
  testID?: string;
}

export function ContractForm({
  initialData,
  onSubmit,
  onCancel,
  submitLabel = '保存',
  testID,
}: ContractFormProps) {
  const [formData, setFormData] = useState<ContractFormData>({
    name: initialData?.name || '',
    category: initialData?.category || 'subscription',
    billingCycle: initialData?.billingCycle || 'monthly',
    amount: initialData?.amount?.toString() || '',
    renewalDate: initialData ? new Date(initialData.renewalDate) : new Date(),
    reminderDays: initialData?.reminderDays?.toString() || DEFAULT_REMINDER_DAYS.toString(),
    notes: initialData?.notes || '',
  });

  const [errors, setErrors] = useState<ValidationErrors>({});
  const [showDatePicker, setShowDatePicker] = useState(false);

  const categories: ContractCategory[] = ['subscription', 'insurance', 'rental', 'other'];
  const billingCycles: BillingCycle[] = ['monthly', 'yearly', 'one-time'];

  const handleSubmit = () => {
    const validationErrors = validateContractForm(formData);
    setErrors(validationErrors);

    if (isValidForm(validationErrors)) {
      onSubmit(formData);
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setFormData({ ...formData, renewalDate: selectedDate });
    }
  };

  const updateField = <K extends keyof ContractFormData>(
    field: K,
    value: ContractFormData[K]
  ) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field as keyof ValidationErrors]) {
      setErrors({ ...errors, [field]: undefined });
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        testID={testID}
      >
        {/* Contract Name */}
        <View style={styles.field}>
          <Text style={styles.label}>契約名 *</Text>
          <TextInput
            style={[styles.input, errors.name && styles.inputError]}
            value={formData.name}
            onChangeText={(text) => updateField('name', text)}
            placeholder="例: Netflix, 自動車保険"
            placeholderTextColor="#BDBDBD"
            testID="input-name"
          />
          {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
        </View>

        {/* Category Selection */}
        <View style={styles.field}>
          <Text style={styles.label}>カテゴリ *</Text>
          <View style={styles.optionGroup}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.optionButton,
                  formData.category === cat && styles.optionSelected,
                ]}
                onPress={() => updateField('category', cat)}
                testID={`category-${cat}`}
              >
                <Text style={styles.optionEmoji}>{CATEGORY_EMOJIS[cat]}</Text>
                <Text
                  style={[
                    styles.optionText,
                    formData.category === cat && styles.optionTextSelected,
                  ]}
                >
                  {CATEGORY_LABELS[cat]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Billing Cycle */}
        <View style={styles.field}>
          <Text style={styles.label}>支払い周期 *</Text>
          <View style={styles.optionGroup}>
            {billingCycles.map((cycle) => (
              <TouchableOpacity
                key={cycle}
                style={[
                  styles.optionButton,
                  styles.cycleButton,
                  formData.billingCycle === cycle && styles.optionSelected,
                ]}
                onPress={() => updateField('billingCycle', cycle)}
                testID={`cycle-${cycle}`}
              >
                <Text
                  style={[
                    styles.optionText,
                    formData.billingCycle === cycle && styles.optionTextSelected,
                  ]}
                >
                  {BILLING_CYCLE_LABELS[cycle]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Amount */}
        <View style={styles.field}>
          <Text style={styles.label}>金額 *</Text>
          <View style={styles.amountContainer}>
            <Text style={styles.currencySymbol}>¥</Text>
            <TextInput
              style={[styles.input, styles.amountInput, errors.amount && styles.inputError]}
              value={formData.amount}
              onChangeText={(text) => updateField('amount', text.replace(/[^0-9]/g, ''))}
              placeholder="0"
              placeholderTextColor="#BDBDBD"
              keyboardType="number-pad"
              testID="input-amount"
            />
          </View>
          {errors.amount && <Text style={styles.errorText}>{errors.amount}</Text>}
        </View>

        {/* Renewal Date */}
        <View style={styles.field}>
          <Text style={styles.label}>更新日 *</Text>
          <TouchableOpacity
            style={[styles.dateButton, errors.renewalDate && styles.inputError]}
            onPress={() => setShowDatePicker(true)}
            testID="input-renewal-date"
          >
            <Text style={styles.dateText}>{formatDate(formData.renewalDate)}</Text>
          </TouchableOpacity>
          {errors.renewalDate && (
            <Text style={styles.errorText}>{errors.renewalDate}</Text>
          )}
        </View>

        {showDatePicker && (
          <DateTimePicker
            value={formData.renewalDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleDateChange}
            testID="date-picker"
          />
        )}

        {/* Reminder Days */}
        <View style={styles.field}>
          <Text style={styles.label}>リマインダー（更新日の何日前）</Text>
          <View style={styles.reminderContainer}>
            <TextInput
              style={[styles.input, styles.reminderInput, errors.reminderDays && styles.inputError]}
              value={formData.reminderDays}
              onChangeText={(text) => updateField('reminderDays', text.replace(/[^0-9]/g, ''))}
              placeholder="7"
              placeholderTextColor="#BDBDBD"
              keyboardType="number-pad"
              testID="input-reminder-days"
            />
            <Text style={styles.daysLabel}>日前</Text>
          </View>
          {errors.reminderDays && (
            <Text style={styles.errorText}>{errors.reminderDays}</Text>
          )}
        </View>

        {/* Notes */}
        <View style={styles.field}>
          <Text style={styles.label}>メモ</Text>
          <TextInput
            style={[styles.input, styles.notesInput]}
            value={formData.notes}
            onChangeText={(text) => updateField('notes', text)}
            placeholder="補足情報があれば入力"
            placeholderTextColor="#BDBDBD"
            multiline
            numberOfLines={3}
            testID="input-notes"
          />
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={onCancel}
            testID="button-cancel"
          >
            <Text style={styles.cancelButtonText}>キャンセル</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmit}
            testID="button-submit"
          >
            <Text style={styles.submitButtonText}>{submitLabel}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  field: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#2C3E50',
  },
  inputError: {
    borderColor: '#E74C3C',
  },
  errorText: {
    color: '#E74C3C',
    fontSize: 12,
    marginTop: 4,
  },
  optionGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 10,
  },
  cycleButton: {
    flex: 1,
    justifyContent: 'center',
  },
  optionSelected: {
    backgroundColor: '#4A90A4',
    borderColor: '#4A90A4',
  },
  optionEmoji: {
    fontSize: 18,
    marginRight: 6,
  },
  optionText: {
    fontSize: 14,
    color: '#7F8C8D',
    fontWeight: '500',
  },
  optionTextSelected: {
    color: '#FFFFFF',
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currencySymbol: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2C3E50',
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
  },
  dateButton: {
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
  },
  dateText: {
    fontSize: 16,
    color: '#2C3E50',
  },
  reminderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reminderInput: {
    width: 80,
    textAlign: 'center',
  },
  daysLabel: {
    fontSize: 16,
    color: '#7F8C8D',
    marginLeft: 8,
  },
  notesInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
    marginBottom: 40,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#7F8C8D',
  },
  submitButton: {
    flex: 1,
    backgroundColor: '#4A90A4',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
