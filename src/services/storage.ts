import AsyncStorage from '@react-native-async-storage/async-storage';
import { Contract } from '../types';

const STORAGE_KEY = '@contracts';

export async function getContracts(): Promise<Contract[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    return JSON.parse(data) as Contract[];
  } catch (error) {
    console.error('Failed to load contracts:', error);
    return [];
  }
}

export async function saveContracts(contracts: Contract[]): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(contracts));
  } catch (error) {
    console.error('Failed to save contracts:', error);
    throw error;
  }
}

export async function getContract(id: string): Promise<Contract | null> {
  const contracts = await getContracts();
  return contracts.find((c) => c.id === id) || null;
}

export async function addContract(contract: Contract): Promise<void> {
  const contracts = await getContracts();
  contracts.push(contract);
  await saveContracts(contracts);
}

export async function updateContract(contract: Contract): Promise<void> {
  const contracts = await getContracts();
  const index = contracts.findIndex((c) => c.id === contract.id);
  if (index === -1) {
    throw new Error(`Contract with id ${contract.id} not found`);
  }
  contracts[index] = contract;
  await saveContracts(contracts);
}

export async function deleteContract(id: string): Promise<void> {
  const contracts = await getContracts();
  const filtered = contracts.filter((c) => c.id !== id);
  await saveContracts(filtered);
}

export async function clearAllContracts(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEY);
}
