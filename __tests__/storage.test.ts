import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getContracts,
  saveContracts,
  getContract,
  addContract,
  updateContract,
  deleteContract,
  clearAllContracts,
} from '../src/services/storage';
import { Contract } from '../src/types';

const createContract = (overrides: Partial<Contract> = {}): Contract => ({
  id: 'test-id',
  name: 'Test Contract',
  category: 'subscription',
  billingCycle: 'monthly',
  amount: 1000,
  renewalDate: new Date().toISOString(),
  reminderDays: 7,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

describe('Storage Service', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  describe('getContracts', () => {
    it('should return empty array when no contracts', async () => {
      const result = await getContracts();
      expect(result).toEqual([]);
    });

    it('should return stored contracts', async () => {
      const contracts = [createContract()];
      await AsyncStorage.setItem('@contracts', JSON.stringify(contracts));
      const result = await getContracts();
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('test-id');
    });

    it('should handle invalid JSON gracefully', async () => {
      await AsyncStorage.setItem('@contracts', 'invalid json');
      const result = await getContracts();
      expect(result).toEqual([]);
    });
  });

  describe('saveContracts', () => {
    it('should save contracts to storage', async () => {
      const contracts = [createContract()];
      await saveContracts(contracts);
      const stored = await AsyncStorage.getItem('@contracts');
      expect(JSON.parse(stored!)).toEqual(contracts);
    });

    it('should overwrite existing contracts', async () => {
      await saveContracts([createContract({ id: '1' })]);
      await saveContracts([createContract({ id: '2' })]);
      const stored = await AsyncStorage.getItem('@contracts');
      const result = JSON.parse(stored!);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('2');
    });
  });

  describe('getContract', () => {
    it('should return contract by id', async () => {
      const contracts = [
        createContract({ id: '1', name: 'First' }),
        createContract({ id: '2', name: 'Second' }),
      ];
      await saveContracts(contracts);
      const result = await getContract('2');
      expect(result?.name).toBe('Second');
    });

    it('should return null for non-existent id', async () => {
      await saveContracts([createContract({ id: '1' })]);
      const result = await getContract('999');
      expect(result).toBeNull();
    });
  });

  describe('addContract', () => {
    it('should add contract to storage', async () => {
      const contract = createContract();
      await addContract(contract);
      const result = await getContracts();
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(contract);
    });

    it('should add to existing contracts', async () => {
      await addContract(createContract({ id: '1' }));
      await addContract(createContract({ id: '2' }));
      const result = await getContracts();
      expect(result).toHaveLength(2);
    });
  });

  describe('updateContract', () => {
    it('should update existing contract', async () => {
      const original = createContract({ id: '1', name: 'Original' });
      await addContract(original);
      const updated = { ...original, name: 'Updated' };
      await updateContract(updated);
      const result = await getContract('1');
      expect(result?.name).toBe('Updated');
    });

    it('should throw error for non-existent contract', async () => {
      const contract = createContract({ id: 'non-existent' });
      await expect(updateContract(contract)).rejects.toThrow(
        'Contract with id non-existent not found'
      );
    });

    it('should not affect other contracts', async () => {
      await addContract(createContract({ id: '1', name: 'First' }));
      await addContract(createContract({ id: '2', name: 'Second' }));
      await updateContract(createContract({ id: '1', name: 'Updated' }));
      const result = await getContracts();
      expect(result[0].name).toBe('Updated');
      expect(result[1].name).toBe('Second');
    });
  });

  describe('deleteContract', () => {
    it('should delete contract by id', async () => {
      await addContract(createContract({ id: '1' }));
      await addContract(createContract({ id: '2' }));
      await deleteContract('1');
      const result = await getContracts();
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('2');
    });

    it('should not throw for non-existent id', async () => {
      await addContract(createContract({ id: '1' }));
      await expect(deleteContract('999')).resolves.toBeUndefined();
    });
  });

  describe('clearAllContracts', () => {
    it('should remove all contracts', async () => {
      await addContract(createContract({ id: '1' }));
      await addContract(createContract({ id: '2' }));
      await clearAllContracts();
      const result = await getContracts();
      expect(result).toEqual([]);
    });
  });
});
