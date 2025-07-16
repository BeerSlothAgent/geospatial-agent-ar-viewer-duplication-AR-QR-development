import { Tabs } from 'expo-router';
import { Camera, Settings, Info, Database, Wallet, Map, Coins, Layers } from 'lucide-react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#000000',
          borderTopColor: '#333',
          borderTopWidth: 1,
          paddingBottom: 8,
          paddingTop: 8,
          height: 70,
        },
        tabBarActiveTintColor: '#00EC97',
        tabBarInactiveTintColor: '#888',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: 4,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'AR Viewer',
          tabBarIcon: ({ size, color }) => (
            <Camera size={size} color={color} strokeWidth={2} />
          ),
        }}
      />
      <Tabs.Screen
        name="database"
        options={{
          title: 'Agents',
          tabBarIcon: ({ size, color }) => (
            <Database size={size} color={color} strokeWidth={2} />
          ),
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: 'AR Map',
          tabBarIcon: ({ size, color }) => (
            <Map size={size} color={color} strokeWidth={2} />
          ),
        }}
      />
      <Tabs.Screen
        name="wallet"
        options={{
          title: 'BDAG Wallet',
          tabBarIcon: ({ size, color }) => (
            <Layers size={size} color={color} strokeWidth={2} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ size, color }) => (
            <Settings size={size} color={color} strokeWidth={2} />
          ),
        }}
      />
      <Tabs.Screen
        name="about"
        options={{
          title: 'About',
          tabBarIcon: ({ size, color }) => (
            <Info size={size} color={color} strokeWidth={2} />
          ),
        }}
      />
    </Tabs>
  );
}