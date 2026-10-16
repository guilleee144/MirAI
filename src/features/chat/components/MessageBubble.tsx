// src/features/chat/components/MessageBubble.tsx
import { memo } from 'react'
import { View, Text } from 'react-native'
import LinearGradient from 'react-native-linear-gradient'
import type { ChatMessage } from '../types'

function CompanionAvatar() {
  return (
    <LinearGradient
      colors={['#6C5CE7', '#00D1FF']}
      style={{ width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 8, marginBottom: 2 }}
    >
      <Text style={{ color: '#fff', fontSize: 13 }}>◎</Text>
    </LinearGradient>
  )
}

function MessageBubbleBase({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user'

  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: isUser ? 'flex-end' : 'flex-start',
        alignItems: 'flex-end',
        paddingHorizontal: 16,
        marginVertical: 4,
      }}
    >
      {!isUser && <CompanionAvatar />}
      <View
        style={{
          maxWidth: '80%',
          paddingHorizontal: 14,
          paddingVertical: 10,
          borderRadius: 18,
          borderBottomRightRadius: isUser ? 6 : 18,
          borderBottomLeftRadius: isUser ? 18 : 6,
          backgroundColor: isUser ? '#6C5CE7' : '#141826',
          borderWidth: isUser ? 0 : 1,
          borderColor: 'rgba(255,255,255,0.06)',
        }}
      >
        <Text selectable style={{ color: isUser ? '#fff' : '#E6EAF2', fontSize: 15, lineHeight: 22 }}>
          {message.content}
        </Text>
      </View>
    </View>
  )
}

export const MessageBubble = memo(MessageBubbleBase)
