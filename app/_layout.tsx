import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { requestNotificationPermissions } from '../src/services/notifications';

export default function RootLayout() {
  useEffect(() => {
    requestNotificationPermissions();
  }, []);

  return (
    <>
      <StatusBar style="auto" />
      <Stack>
        <Stack.Screen 
          name="(tabs)" 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="add" 
          options={{ 
            title: '契約を追加',
            presentation: 'modal',
            headerStyle: { backgroundColor: '#f5f5f5' },
          }} 
        />
        <Stack.Screen 
          name="edit/[id]" 
          options={{ 
            title: '契約を編集',
            presentation: 'modal',
            headerStyle: { backgroundColor: '#f5f5f5' },
          }} 
        />
      </Stack>
    </>
  );
}
