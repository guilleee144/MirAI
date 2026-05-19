// app/(app)/chat.tsx
import { View, Text } from 'react-native'

export default function ChatScreen() {
  return (
    <View className="flex-1 bg-[#0B0F17] items-center justify-center">
      <Text className="text-white text-2xl font-bold">Chat</Text>
      <Text className="text-[#7B8496] mt-2">AI Companion coming soon...</Text>
    </View>
  )
}