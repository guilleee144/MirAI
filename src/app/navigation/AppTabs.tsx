// src/app/navigation/AppTabs.tsx
// Replaces app/(app)/_layout.tsx (expo-router Tabs).
import { Platform, Text, View } from 'react-native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import type { AppTabParamList } from './types'
import { HomeScreen } from '@/features/home/screens/HomeScreen'
import { ChatScreen } from '@/features/chat/screens/ChatScreen'
import { DiscoverScreen } from '@/features/discover/screens/DiscoverScreen'
import { LibraryScreen } from '@/features/library/screens/LibraryScreen'
import { ProfileScreen } from '@/features/profile/screens/ProfileScreen'

const Tab = createBottomTabNavigator<AppTabParamList>()

function TabIcon({ focused, icon, label }: { focused: boolean; icon: string; label: string }) {
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', width: 60, height: 50, gap: 3 }}>
      <Text style={{ fontSize: 22, color: focused ? '#6C5CE7' : '#B8C1D1' }}>{icon}</Text>
      <Text style={{ fontSize: 11, color: focused ? '#6C5CE7' : '#B8C1D1', fontWeight: focused ? '600' : '400' }}>
        {label}
      </Text>
    </View>
  )
}

export function AppTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#141826',
          borderTopColor: 'rgba(255,255,255,0.06)',
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 84 : 64,
          paddingBottom: Platform.OS === 'ios' ? 24 : 8,
          paddingTop: 8,
        },
        tabBarShowLabel: false,
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon focused={focused} icon="⌂" label="Home" /> }}
      />
      <Tab.Screen
        name="Chat"
        component={ChatScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon focused={focused} icon="◎" label="Chat" /> }}
      />
      <Tab.Screen
        name="Discover"
        component={DiscoverScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon focused={focused} icon="✦" label="Discover" /> }}
      />
      <Tab.Screen
        name="Library"
        component={LibraryScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon focused={focused} icon="◈" label="Library" /> }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon focused={focused} icon="○" label="Profile" /> }}
      />
    </Tab.Navigator>
  )
}
