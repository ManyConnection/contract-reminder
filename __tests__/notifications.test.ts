import * as Notifications from 'expo-notifications';
import {
  requestNotificationPermissions,
  scheduleContractReminder,
  cancelContractReminder,
  updateContractReminder,
  getAllScheduledNotifications,
  cancelAllNotifications,
} from '../src/services/notifications';
import { Contract } from '../src/types';

const createContract = (overrides: Partial<Contract> = {}): Contract => ({
  id: 'test-id',
  name: 'Test Contract',
  category: 'subscription',
  billingCycle: 'monthly',
  amount: 1000,
  renewalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  reminderDays: 7,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

describe('Notifications Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('requestNotificationPermissions', () => {
    it('should request permissions when not granted', async () => {
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValueOnce({
        status: 'undetermined',
      });
      (Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValueOnce({
        status: 'granted',
      });

      const result = await requestNotificationPermissions();
      expect(result).toBe(true);
      expect(Notifications.requestPermissionsAsync).toHaveBeenCalled();
    });

    it('should return true if already granted', async () => {
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValueOnce({
        status: 'granted',
      });

      const result = await requestNotificationPermissions();
      expect(result).toBe(true);
    });

    it('should return false if denied', async () => {
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValueOnce({
        status: 'denied',
      });
      (Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValueOnce({
        status: 'denied',
      });

      const result = await requestNotificationPermissions();
      expect(result).toBe(false);
    });
  });

  describe('scheduleContractReminder', () => {
    it('should schedule notification for future renewal', async () => {
      const contract = createContract({
        renewalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        reminderDays: 7,
      });

      const result = await scheduleContractReminder(contract);
      expect(result).toBe('notification-id');
      expect(Notifications.scheduleNotificationAsync).toHaveBeenCalled();
    });

    it('should not schedule if reminder date is in the past', async () => {
      const contract = createContract({
        renewalDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        reminderDays: 10,
      });

      const result = await scheduleContractReminder(contract);
      expect(result).toBeNull();
    });

    it('should include contract name in notification', async () => {
      const contract = createContract({
        name: 'Netflix',
        renewalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      });

      await scheduleContractReminder(contract);
      const call = (Notifications.scheduleNotificationAsync as jest.Mock).mock.calls[0];
      expect(call[0].content.body).toContain('Netflix');
    });

    it('should include category in notification', async () => {
      const contract = createContract({
        category: 'subscription',
        renewalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      });

      await scheduleContractReminder(contract);
      const call = (Notifications.scheduleNotificationAsync as jest.Mock).mock.calls[0];
      expect(call[0].content.body).toContain('サブスク');
    });
  });

  describe('cancelContractReminder', () => {
    it('should cancel notification by id', async () => {
      await cancelContractReminder('test-notification-id');
      expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledWith(
        'test-notification-id'
      );
    });
  });

  describe('updateContractReminder', () => {
    it('should cancel old and schedule new notification', async () => {
      const contract = createContract({
        notificationId: 'old-id',
        renewalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      });

      await updateContractReminder(contract);
      expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledWith('old-id');
      expect(Notifications.scheduleNotificationAsync).toHaveBeenCalled();
    });

    it('should just schedule if no existing notification', async () => {
      const contract = createContract({
        renewalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      });

      await updateContractReminder(contract);
      expect(Notifications.cancelScheduledNotificationAsync).not.toHaveBeenCalled();
      expect(Notifications.scheduleNotificationAsync).toHaveBeenCalled();
    });
  });

  describe('getAllScheduledNotifications', () => {
    it('should return all scheduled notifications', async () => {
      const result = await getAllScheduledNotifications();
      expect(Notifications.getAllScheduledNotificationsAsync).toHaveBeenCalled();
      expect(result).toEqual([]);
    });
  });

  describe('cancelAllNotifications', () => {
    it('should cancel all scheduled notifications', async () => {
      (Notifications.getAllScheduledNotificationsAsync as jest.Mock).mockResolvedValueOnce([
        { identifier: 'id1' },
        { identifier: 'id2' },
      ]);

      await cancelAllNotifications();
      expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledTimes(2);
    });

    it('should handle empty list', async () => {
      (Notifications.getAllScheduledNotificationsAsync as jest.Mock).mockResolvedValueOnce([]);

      await cancelAllNotifications();
      expect(Notifications.cancelScheduledNotificationAsync).not.toHaveBeenCalled();
    });
  });
});
