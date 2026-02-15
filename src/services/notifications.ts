// Notifications disabled - stub file
import { Contract } from '../types';

export async function requestNotificationPermissions(): Promise<boolean> {
  return false;
}

export async function scheduleContractReminders(contract: Contract): Promise<string[]> {
  return [];
}

export async function cancelContractReminders(contractId: string): Promise<void> {
  // No-op
}

export async function cancelAllNotifications(): Promise<void> {
  // No-op
}

export async function getScheduledNotifications(): Promise<any[]> {
  return [];
}
