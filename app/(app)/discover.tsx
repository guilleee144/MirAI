// app/(app)/discover.tsx
import { View, Text } from 'react-native'

export default function DiscoverScreen() {
  return (
    <View className="flex-1 bg-[#0B0F17] items-center justify-center">
      <Text className="text-white text-2xl font-bold">Discover</Text>
      <Text className="text-[#7B8496] mt-2">Recommendations coming soon...</Text>
    </View>
  )
}