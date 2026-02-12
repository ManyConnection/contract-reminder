import AsyncStorage from '@react-native-async-storage/async-storage';
import * as StorageService from '../services/storage';
import { Contract } from '../types';

describe('StorageService', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  const mockContract: Contract = {
    id: 'test-id-1',
    name: 'Netflix',
    category: 'subscription',
    billingCycle: 'monthly',
    amount: 1500,
    renewalDate: '2025-01-01T00:00:00.000Z',
    reminderDays: 7,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  };

  describe('getContracts', () => {
    it('should return empty array when no contracts exist', async () => {
      const contracts = await StorageService.getContracts();
      expect(contracts).toEqual([]);
    });

    it('should return saved contracts', async () => {
      await AsyncStorage.setItem('@contracts', JSON.stringify([mockContract]));
      const contracts = await StorageService.getContracts();
      expect(contracts).toEqual([mockContract]);
    });
  });

  describe('saveContracts', () => {
    it('should save contracts to AsyncStorage', async () => {
      await StorageService.saveContracts([mockContract]);
      const stored = await AsyncStorage.getItem('@contracts');
      expect(JSON.parse(stored!)).toEqual([mockContract]);
    });
  });

  describe('addContract', () => {
    it('should add a new contract', async () => {
      await StorageService.addContract(mockContract);
      const contracts = await StorageService.getContracts();
      expect(contracts).toHaveLength(1);
      expect(contracts[0]).toEqual(mockContract);
    });

    it('should append to existing contracts', async () => {
      const secondContract = { ...mockContract, id: 'test-id-2', name: 'Spotify' };
      await StorageService.addContract(mockContract);
      await StorageService.addContract(secondContract);
      const contracts = await StorageService.getContracts();
      expect(contracts).toHaveLength(2);
    });
  });

  describe('updateContract', () => {
    it('should update an existing contract', async () => {
      await StorageService.addContract(mockContract);
      const updatedContract = { ...mockContract, name: 'Updated Netflix', amount: 2000 };
      await StorageService.updateContract(updatedContract);
      const contracts = await StorageService.getContracts();
      expect(contracts[0].name).toBe('Updated Netflix');
      expect(contracts[0].amount).toBe(2000);
    });

    it('should throw error when contract not found', async () => {
      await expect(StorageService.updateContract(mockContract)).rejects.toThrow();
    });
  });

  describe('deleteContract', () => {
    it('should delete a contract', async () => {
      await StorageService.addContract(mockContract);
      await StorageService.deleteContract(mockContract.id);
      const contracts = await StorageService.getContracts();
      expect(contracts).toHaveLength(0);
    });

    it('should not affect other contracts when deleting', async () => {
      const secondContract = { ...mockContract, id: 'test-id-2' };
      await StorageService.addContract(mockContract);
      await StorageService.addContract(secondContract);
      await StorageService.deleteContract(mockContract.id);
      const contracts = await StorageService.getContracts();
      expect(contracts).toHaveLength(1);
      expect(contracts[0].id).toBe('test-id-2');
    });
  });

  describe('getContract', () => {
    it('should return a specific contract by id', async () => {
      await StorageService.addContract(mockContract);
      const contract = await StorageService.getContract(mockContract.id);
      expect(contract).toEqual(mockContract);
    });

    it('should return null for non-existent contract', async () => {
      const contract = await StorageService.getContract('non-existent');
      expect(contract).toBeNull();
    });
  });

  describe('clearAllContracts', () => {
    it('should clear all contracts', async () => {
      await StorageService.addContract(mockContract);
      await StorageService.clearAllContracts();
      const contracts = await StorageService.getContracts();
      expect(contracts).toHaveLength(0);
    });
  });
});
