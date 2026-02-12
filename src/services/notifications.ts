import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { Contract, CATEGORY_LABELS } from '../types';
import { addDays, subDays, startOfDay, isAfter, format } from 'date-fns';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function requestNotificationPermissions(): Promise<boolean> {
  if (!Device.isDevice) {
    console.log('Notifications only work on physical devices');
    return false;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('Failed to get notification permissions');
    return false;
  }

  // Set up Android notification channel
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('contract-reminders', {
      name: '契約更新リマインダー',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#4A90A4',
    });
  }

  return true;
}

export async function scheduleContractReminder(
  contract: Contract
): Promise<string | null> {
  const renewalDate = new Date(contract.renewalDate);
  const reminderDate = subDays(startOfDay(renewalDate), contract.reminderDays);
  
  // Set notification time to 9:00 AM
  reminderDate.setHours(9, 0, 0, 0);

  // Don't schedule if reminder date is in the past
  if (!isAfter(reminderDate, new Date())) {
    return null;
  }

  const categoryLabel = CATEGORY_LABELS[contract.category];
  const formattedDate = format(renewalDate, 'yyyy年M月d日');

  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title: '📅 契約更新リマインダー',
      body: `${contract.name}（${categoryLabel}）の更新日が${formattedDate}に近づいています。`,
      data: { contractId: contract.id },
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: reminderDate,
    },
  });

  return notificationId;
}

export async function cancelContractReminder(
  notificationId: string
): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(notificationId);
}

export async function updateContractReminder(
  contract: Contract
): Promise<string | null> {
  // Cancel existing notification if any
  if (contract.notificationId) {
    await cancelContractReminder(contract.notificationId);
  }

  // Schedule new notification
  return scheduleContractReminder(contract);
}

export async function getAllScheduledNotifications(): Promise<
  Notifications.NotificationRequest[]
> {
  return Notifications.getAllScheduledNotificationsAsync();
}

export async function cancelAllNotifications(): Promise<void> {
  const scheduled = await getAllScheduledNotifications();
  for (const notification of scheduled) {
    await Notifications.cancelScheduledNotificationAsync(notification.identifier);
  }
}
