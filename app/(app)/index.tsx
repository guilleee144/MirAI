// app/(app)/index.tsx
import { View, Text } from 'react-native'

export default function HomeScreen() {
  return (
    <View className="flex-1 bg-[#0B0F17] items-center justify-center">
      <Text className="text-white text-2xl font-bold">Home</Text>
      <Text className="text-[#7B8496] mt-2">Coming soon...</Text>
    </View>
  )
}