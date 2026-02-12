import { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Contract, ContractFormData, ContractCategory } from '../types';
import * as StorageService from '../services/storage';
import * as NotificationService from '../services/notifications';
import {
  calculateTotalAnnualCost,
  calculateTotalMonthlyCost,
  calculateCostByCategory,
  sortByRenewalDate,
  filterByCategory,
  getUpcomingRenewals,
  getDaysUntilRenewal,
} from '../utils';

interface UseContractsReturn {
  contracts: Contract[];
  loading: boolean;
  error: string | null;
  addContract: (data: ContractFormData) => Promise<void>;
  updateContract: (id: string, data: ContractFormData) => Promise<void>;
  deleteContract: (id: string) => Promise<void>;
  refreshContracts: () => Promise<void>;
  getContractsByCategory: (category: ContractCategory) => Contract[];
  getAnnualCost: () => number;
  getMonthlyCost: () => number;
  getCostByCategory: () => Record<ContractCategory, number>;
  getContractsSortedByRenewal: () => Contract[];
  getUpcomingRenewals: (days?: number) => Contract[];
}

export function useContracts(): UseContractsReturn {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshContracts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await StorageService.getContracts();
      setContracts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '予期しないエラーが発生しました');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshContracts();
  }, [refreshContracts]);

  const addContract = useCallback(async (data: ContractFormData) => {
    try {
      setError(null);
      const now = new Date().toISOString();
      
      const newContract: Contract = {
        id: uuidv4(),
        name: data.name.trim(),
        category: data.category,
        billingCycle: data.billingCycle,
        amount: parseInt(data.amount, 10),
        renewalDate: data.renewalDate.toISOString(),
        reminderDays: parseInt(data.reminderDays, 10),
        notes: data.notes?.trim() || undefined,
        createdAt: now,
        updatedAt: now,
      };

      // Schedule notification
      const notificationId = await NotificationService.scheduleContractReminder(newContract);
      if (notificationId) {
        newContract.notificationId = notificationId;
      }

      await StorageService.addContract(newContract);
      await refreshContracts();
    } catch (err) {
      const message = err instanceof Error ? err.message : '契約の追加に失敗しました';
      setError(message);
      throw new Error(message);
    }
  }, [refreshContracts]);

  const updateContract = useCallback(async (id: string, data: ContractFormData) => {
    try {
      setError(null);
      const existing = contracts.find(c => c.id === id);
      if (!existing) {
        throw new Error('契約が見つかりません');
      }

      const updatedContract: Contract = {
        ...existing,
        name: data.name.trim(),
        category: data.category,
        billingCycle: data.billingCycle,
        amount: parseInt(data.amount, 10),
        renewalDate: data.renewalDate.toISOString(),
        reminderDays: parseInt(data.reminderDays, 10),
        notes: data.notes?.trim() || undefined,
        updatedAt: new Date().toISOString(),
      };

      // Update notification
      const notificationId = await NotificationService.updateContractReminder(updatedContract);
      if (notificationId) {
        updatedContract.notificationId = notificationId;
      }

      await StorageService.updateContract(updatedContract);
      await refreshContracts();
    } catch (err) {
      const message = err instanceof Error ? err.message : '契約の更新に失敗しました';
      setError(message);
      throw new Error(message);
    }
  }, [contracts, refreshContracts]);

  const deleteContract = useCallback(async (id: string) => {
    try {
      setError(null);
      const contract = contracts.find(c => c.id === id);
      
      // Cancel notification if exists
      if (contract?.notificationId) {
        await NotificationService.cancelContractReminder(contract.notificationId);
      }

      await StorageService.deleteContract(id);
      await refreshContracts();
    } catch (err) {
      const message = err instanceof Error ? err.message : '契約の削除に失敗しました';
      setError(message);
      throw new Error(message);
    }
  }, [contracts, refreshContracts]);

  const getContractsByCategory = useCallback((category: ContractCategory) => {
    return filterByCategory(contracts, category);
  }, [contracts]);

  const getAnnualCost = useCallback(() => {
    return calculateTotalAnnualCost(contracts);
  }, [contracts]);

  const getMonthlyCost = useCallback(() => {
    return calculateTotalMonthlyCost(contracts);
  }, [contracts]);

  const getCostByCategory = useCallback(() => {
    return calculateCostByCategory(contracts);
  }, [contracts]);

  const getContractsSortedByRenewal = useCallback(() => {
    return sortByRenewalDate(contracts);
  }, [contracts]);

  const getUpcomingRenewalsCallback = useCallback((days: number = 30) => {
    return getUpcomingRenewals(contracts, days);
  }, [contracts]);

  return {
    contracts,
    loading,
    error,
    addContract,
    updateContract,
    deleteContract,
    refreshContracts,
    getContractsByCategory,
    getAnnualCost,
    getMonthlyCost,
    getCostByCategory,
    getContractsSortedByRenewal,
    getUpcomingRenewals: getUpcomingRenewalsCallback,
  };
}
