// src/features/chat/components/ChatInput.tsx
import { View, TextInput, TouchableOpacity, Text } from 'react-native'
import LinearGradient from 'react-native-linear-gradient'

interface ChatInputProps {
  value: string
  onChangeText: (text: string) => void
  onSend: () => void
  /** Blocks sending (e.g. while MirAI is replying) without blocking typing. */
  sendDisabled?: boolean
}

export function ChatInput({ value, onChangeText, onSend, sendDisabled }: ChatInputProps) {
  const canSend = value.trim().length > 0 && !sendDisabled

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: 10,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.06)',
        backgroundColor: '#0B0F17',
      }}
    >
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder="Message MirAI..."
        placeholderTextColor="#7B8496"
        multiline
        maxLength={2000}
        style={{
          flex: 1,
          maxHeight: 120,
          minHeight: 44,
          backgroundColor: '#141826',
          borderRadius: 22,
          paddingHorizontal: 18,
          paddingTop: 12,
          paddingBottom: 12,
          color: '#fff',
          fontSize: 15,
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.08)',
        }}
      />
      <TouchableOpacity onPress={onSend} disabled={!canSend} activeOpacity={0.8}>
        <LinearGradient
          colors={canSend ? ['#6C5CE7', '#8B7FF0'] : ['#1B2133', '#1B2133']}
          style={{ width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' }}
        >
          <Text style={{ color: canSend ? '#fff' : '#7B8496', fontSize: 18, fontWeight: '700' }}>↑</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  )
}
