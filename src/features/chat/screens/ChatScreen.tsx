// src/features/chat/screens/ChatScreen.tsx
// Migrated as-is — was already a placeholder in the Expo version, real AI
// companion chat comes later per the roadmap.
import { View, Text } from 'react-native'
import { colors } from '@/theme/colors'

export function ChatScreen() {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.background.primary,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text style={{ color: colors.text.primary, fontSize: 24, fontWeight: '700' }}>Chat</Text>
      <Text style={{ color: colors.text.tertiary, marginTop: 8 }}>AI Companion coming soon...</Text>
    </View>
  )
}
