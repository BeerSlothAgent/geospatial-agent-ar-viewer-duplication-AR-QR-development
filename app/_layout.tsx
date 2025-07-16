import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ThirdwebProvider } from "thirdweb/react";
import { createThirdwebClient } from "thirdweb";
import { useFrameworkReady } from '@/hooks/useFrameworkReady';

const client = createThirdwebClient({
  clientId: process.env.EXPO_PUBLIC_THIRDWEB_CLIENT_ID || "299516306b51bd6356fd8995ed628950",
});

export default function RootLayout() {
  useFrameworkReady();

  return (
    <ThirdwebProvider client={client}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </ThirdwebProvider>
  );
}