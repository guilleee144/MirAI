// app/(app)/_layout.tsx
import { Tabs } from 'expo-router'
import { View, Text } from 'react-native'
import { BlurView } from 'expo-blur'
import { Platform } from 'react-native'

function TabIcon({ focused, icon, label }: { focused: boolean; icon: string; label: string }) {
  return (
    <View className="items-center justify-center pt-2">
      <Text style={{ fontSize: 20 }}>{icon}</Text>
      <Text
        className={`text-xs mt-1 ${focused ? 'text-[#6C5CE7]' : 'text-[#7B8496]'}`}
      >
        {label}
      </Text>
      {focused && (
        <View className="w-1 h-1 rounded-full bg-[#6C5CE7] mt-1" />
      )}
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
          height: Platform.OS === 'ios' ? 85 : 65,
          paddingBottom: Platform.OS === 'ios' ? 25 : 8,
        },
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon="⌂" label="Home" />
          ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon="◎" label="Chat" />
          ),
        }}
      />
      <Tabs.Screen
        name="discover"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon="✦" label="Discover" />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon="◈" label="Profile" />
          ),
        }}
      />
    </Tabs>
  )
}