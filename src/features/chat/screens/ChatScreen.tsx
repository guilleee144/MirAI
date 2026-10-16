// src/features/chat/screens/ChatScreen.tsx
// AI companion chat. Server logic lives in supabase/functions/chat; state and
// optimistic updates live in useChat. This file is layout + wiring only.
import { useCallback, useState } from 'react'
import { ActivityIndicator, FlatList, KeyboardAvoidingView, Text, TouchableOpacity, View } from 'react-native'
import LinearGradient from 'react-native-linear-gradient'
import { useAuth } from '@/providers/AuthProvider'
import { useChat } from '../hooks/useChat'
import type { ChatMessage } from '../types'
import { MessageBubble } from '../components/MessageBubble'
import { TypingIndicator } from '../components/TypingIndicator'
import { ChatInput } from '../components/ChatInput'
import { ChatEmptyState } from '../components/ChatEmptyState'

const keyExtractor = (item: ChatMessage) => item.id
const renderItem = ({ item }: { item: ChatMessage }) => <MessageBubble message={item} />

export function ChatScreen() {
  const { user } = useAuth()
  const { messages, isLoading, isError, refetch, isSending, send } = useChat()
  const [draft, setDraft] = useState('')
  const [sendError, setSendError] = useState<string | null>(null)

  const name: string = user?.user_metadata?.['username'] ?? 'there'

  const sendText = useCallback(
    (raw: string) => {
      const text = raw.trim()
      if (!text || isSending) return

      setDraft('')
      setSendError(null)
      send(text, {
        onError: (error) => {
          // Give the text back so nothing the user typed is lost.
          setDraft((current) => current || text)
          setSendError(error.message)
        },
      })
    },
    [isSending, send]
  )

  const handleSendPress = useCallback(() => sendText(draft), [draft, sendText])

  const showEmptyState = !isLoading && !isError && messages.length === 0

  return (
    // 'padding' on both platforms: this project has edgeToEdgeEnabled=true
    // (targetSdk 36), where Android's adjustResize no longer resizes the window.
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: '#0B0F17' }} behavior="padding">
      <LinearGradient
        colors={['rgba(108,92,231,0.12)', 'transparent']}
        pointerEvents="none"
        style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 220 }}
      />

      {/* Header */}
      <View style={{ paddingHorizontal: 20, paddingTop: 56, paddingBottom: 14, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <LinearGradient
          colors={['#6C5CE7', '#00D1FF']}
          style={{ width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' }}
        >
          <Text style={{ color: '#fff', fontSize: 18 }}>◎</Text>
        </LinearGradient>
        <View>
          <Text style={{ color: '#fff', fontSize: 20, fontWeight: '800', letterSpacing: -0.5 }}>MirAI</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 }}>
            <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#2EE59D' }} />
            <Text style={{ color: '#7B8496', fontSize: 12 }}>Your anime, manga & gaming companion</Text>
          </View>
        </View>
      </View>

      {/* Body */}
      {isLoading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color="#6C5CE7" size="large" />
        </View>
      ) : isError ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 }}>
          <Text style={{ color: '#B8C1D1', fontSize: 15, textAlign: 'center', marginBottom: 16 }}>
            Couldn't load your conversation.
          </Text>
          <TouchableOpacity onPress={() => refetch()} activeOpacity={0.8}>
            <LinearGradient colors={['#6C5CE7', '#8B7FF0']} style={{ borderRadius: 12, paddingHorizontal: 24, paddingVertical: 12 }}>
              <Text style={{ color: '#fff', fontSize: 14, fontWeight: '600' }}>Try again</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      ) : showEmptyState ? (
        <ChatEmptyState name={name} onSelectSuggestion={sendText} />
      ) : (
        <FlatList
          data={messages}
          inverted
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          // In an inverted list the header renders at the visual bottom.
          ListHeaderComponent={isSending ? <TypingIndicator /> : null}
          contentContainerStyle={{ paddingVertical: 12 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Send error */}
      {sendError && (
        <TouchableOpacity onPress={() => setSendError(null)} activeOpacity={0.8}>
          <View
            style={{
              marginHorizontal: 16,
              marginBottom: 8,
              paddingHorizontal: 14,
              paddingVertical: 10,
              borderRadius: 12,
              backgroundColor: 'rgba(255,107,107,0.08)',
              borderWidth: 1,
              borderColor: 'rgba(255,107,107,0.2)',
            }}
          >
            <Text style={{ color: '#FF6B6B', fontSize: 13 }}>{sendError}</Text>
          </View>
        </TouchableOpacity>
      )}

      <ChatInput value={draft} onChangeText={setDraft} onSend={handleSendPress} sendDisabled={isSending} />
    </KeyboardAvoidingView>
  )
}
