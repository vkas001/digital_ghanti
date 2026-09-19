import '../global.css';

import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { PreferenceProvider } from '@/context/PreferenceContext';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PreferenceProvider>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: '#FFF7E6' },
            animation: 'slide_from_right',
          }}
        />
        <StatusBar style="dark" />
      </PreferenceProvider>
    </GestureHandlerRootView>
  );
}