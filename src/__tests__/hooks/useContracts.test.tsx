import { renderHook, act, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useContracts } from '../../hooks/useContracts';
import { ContractFormData } from '../../types';

describe('useContracts', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    jest.clearAllMocks();
  });

  const createFormData = (overrides: Partial<ContractFormData> = {}): ContractFormData => ({
    name: 'Test Contract',
    category: 'subscription',
    billingCycle: 'monthly',
    amount: '1000',
    renewalDate: new Date(),
    reminderDays: '7',
    notes: '',
    ...overrides,
  });

  it('should initialize with empty contracts', async () => {
    const { result } = renderHook(() => useContracts());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.contracts).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it('should load existing contracts from storage', async () => {
    const existingContract = {
      id: 'existing-id',
      name: 'Existing Contract',
      category: 'subscription',
      billingCycle: 'monthly',
      amount: 1000,
      renewalDate: '2025-01-01T00:00:00.000Z',
      reminderDays: 7,
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    };

    await AsyncStorage.setItem('@contracts', JSON.stringify([existingContract]));

    const { result } = renderHook(() => useContracts());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.contracts).toHaveLength(1);
    expect(result.current.contracts[0].name).toBe('Existing Contract');
  });

  it('should add a new contract', async () => {
    const { result } = renderHook(() => useContracts());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.addContract(createFormData({ name: 'New Contract' }));
    });

    expect(result.current.contracts).toHaveLength(1);
    expect(result.current.contracts[0].name).toBe('New Contract');
  });

  it('should calculate annual cost correctly', async () => {
    const contracts = [
      {
        id: 'cost-1',
        name: 'Monthly Sub',
        category: 'subscription',
        billingCycle: 'monthly',
        amount: 1000,
        renewalDate: '2025-01-01T00:00:00.000Z',
        reminderDays: 7,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      },
      {
        id: 'cost-2',
        name: 'Yearly Insurance',
        category: 'insurance',
        billingCycle: 'yearly',
        amount: 5000,
        renewalDate: '2025-01-01T00:00:00.000Z',
        reminderDays: 30,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      },
    ];

    await AsyncStorage.setItem('@contracts', JSON.stringify(contracts));

    const { result } = renderHook(() => useContracts());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Monthly: 1000 * 12 = 12000, Yearly: 5000, Total: 17000
    expect(result.current.getAnnualCost()).toBe(17000);
  });

  it('should filter contracts by category', async () => {
    const contracts = [
      {
        id: 'cat-1',
        name: 'Subscription 1',
        category: 'subscription',
        billingCycle: 'monthly',
        amount: 1000,
        renewalDate: '2025-01-01T00:00:00.000Z',
        reminderDays: 7,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      },
      {
        id: 'cat-2',
        name: 'Insurance 1',
        category: 'insurance',
        billingCycle: 'yearly',
        amount: 10000,
        renewalDate: '2025-01-01T00:00:00.000Z',
        reminderDays: 30,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      },
    ];

    await AsyncStorage.setItem('@contracts', JSON.stringify(contracts));

    const { result } = renderHook(() => useContracts());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const subscriptions = result.current.getContractsByCategory('subscription');
    expect(subscriptions).toHaveLength(1);
    expect(subscriptions[0].name).toBe('Subscription 1');
  });

  it('should sort contracts by renewal date', async () => {
    const contracts = [
      {
        id: 'sort-1',
        name: 'Later',
        category: 'subscription',
        billingCycle: 'monthly',
        amount: 1000,
        renewalDate: '2025-12-01T00:00:00.000Z',
        reminderDays: 7,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      },
      {
        id: 'sort-2',
        name: 'Earlier',
        category: 'insurance',
        billingCycle: 'yearly',
        amount: 5000,
        renewalDate: '2025-03-01T00:00:00.000Z',
        reminderDays: 30,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      },
    ];

    await AsyncStorage.setItem('@contracts', JSON.stringify(contracts));

    const { result } = renderHook(() => useContracts());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const sorted = result.current.getContractsSortedByRenewal();
    expect(sorted[0].name).toBe('Earlier');
    expect(sorted[1].name).toBe('Later');
  });

  it('should delete a contract', async () => {
    const existingContract = {
      id: 'delete-test-id',
      name: 'To Delete',
      category: 'subscription',
      billingCycle: 'monthly',
      amount: 1000,
      renewalDate: '2025-01-01T00:00:00.000Z',
      reminderDays: 7,
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    };

    await AsyncStorage.setItem('@contracts', JSON.stringify([existingContract]));

    const { result } = renderHook(() => useContracts());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.contracts).toHaveLength(1);

    await act(async () => {
      await result.current.deleteContract('delete-test-id');
    });

    expect(result.current.contracts).toHaveLength(0);
  });

  it('should get cost by category', async () => {
    const contracts = [
      {
        id: '1',
        name: 'Sub 1',
        category: 'subscription',
        billingCycle: 'monthly',
        amount: 1000,
        renewalDate: '2025-01-01T00:00:00.000Z',
        reminderDays: 7,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      },
      {
        id: '2',
        name: 'Insurance',
        category: 'insurance',
        billingCycle: 'yearly',
        amount: 50000,
        renewalDate: '2025-01-01T00:00:00.000Z',
        reminderDays: 30,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      },
    ];

    await AsyncStorage.setItem('@contracts', JSON.stringify(contracts));

    const { result } = renderHook(() => useContracts());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const costByCategory = result.current.getCostByCategory();
    expect(costByCategory.subscription).toBe(12000); // 1000 * 12
    expect(costByCategory.insurance).toBe(50000);
    expect(costByCategory.rental).toBe(0);
    expect(costByCategory.other).toBe(0);
  });
});
