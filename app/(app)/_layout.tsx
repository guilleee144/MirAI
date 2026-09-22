// app/(app)/_layout.tsx
import { Tabs } from 'expo-router'
import { View, Text, Platform } from 'react-native'

function TabIcon({ focused, icon, label }: { focused: boolean; icon: string; label: string }) {
  return (
    <View style={{
      alignItems: 'center',
      justifyContent: 'center',
      width: 60,
      height: 50,
      gap: 3,
    }}>
      <Text style={{ fontSize: 22, color: focused ? '#6C5CE7' : '#B8C1D1' }}>
        {icon}
      </Text>
      <Text style={{
        fontSize: 11,
        color: focused ? '#6C5CE7' : '#B8C1D1',
        fontWeight: focused ? '600' : '400',
      }}>
        {label}
      </Text>
    </View>
  )
}

export default function AppLayout() {
  return (
    <Tabs
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
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} icon="⌂" label="Home" />,
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} icon="◎" label="Chat" />,
        }}
      />
      <Tabs.Screen
        name="discover"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} icon="✦" label="Discover" />,
        }}
      />
      <Tabs.Screen
        name="library/index"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} icon="◈" label="Library" />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} icon="○" label="Profile" />,
        }}
      />
    </Tabs>
  )
}