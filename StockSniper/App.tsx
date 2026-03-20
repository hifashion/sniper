import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Feather } from '@expo/vector-icons';

import { MarketsScreen } from './src/screens/MarketsScreen';
import { WatchlistScreen } from './src/screens/WatchlistScreen';
import { FuturesScreen } from './src/screens/FuturesScreen';
import { DetailScreen } from './src/screens/DetailScreen';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      retryDelay: 1000,
    },
  },
});

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function MarketsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MarketsMain" component={MarketsScreen} />
      <Stack.Screen name="Detail" component={DetailScreen} />
    </Stack.Navigator>
  );
}

function WatchlistStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="WatchlistMain" component={WatchlistScreen} />
      <Stack.Screen name="Detail" component={DetailScreen} />
    </Stack.Navigator>
  );
}

function FuturesStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="FuturesMain" component={FuturesScreen} />
      <Stack.Screen name="Detail" component={DetailScreen} />
    </Stack.Navigator>
  );
}

const TAB_BAR_STYLE = {
  backgroundColor: '#0D0D1A',
  borderTopColor: '#1A1A2E',
  borderTopWidth: 1,
  paddingBottom: 6,
  paddingTop: 6,
  height: 60,
};

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <NavigationContainer>
        <StatusBar style="light" />
        <Tab.Navigator
          screenOptions={({ route }) => ({
            headerShown: false,
            tabBarStyle: TAB_BAR_STYLE,
            tabBarActiveTintColor: '#00C087',
            tabBarInactiveTintColor: '#555',
            tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
            tabBarIcon: ({ color, size }: { color: string; size: number }) => {
              let icon: keyof typeof Feather.glyphMap = 'activity';
              if (route.name === 'Markets') icon = 'trending-up';
              if (route.name === 'Watchlist') icon = 'star';
              if (route.name === 'FuturesTab') icon = 'bar-chart-2';
              return <Feather name={icon} size={size - 2} color={color} />;
            },
          })}
        >
          <Tab.Screen name="Markets" component={MarketsStack} />
          <Tab.Screen name="Watchlist" component={WatchlistStack} />
          <Tab.Screen
            name="FuturesTab"
            component={FuturesStack}
            options={{ tabBarLabel: 'Futures' }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </QueryClientProvider>
  );
}
