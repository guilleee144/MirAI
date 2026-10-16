// src/features/chat/components/ChatEmptyState.tsx
import { View, Text, TouchableOpacity } from 'react-native'
import LinearGradient from 'react-native-linear-gradient'

const SUGGESTIONS = [
  'Recommend me something for tonight',
  'I want something emotional',
  'What should I play next?',
  'Surprise me',
]

interface ChatEmptyStateProps {
  name: string
  onSelectSuggestion: (text: string) => void
}

export function ChatEmptyState({ name, onSelectSuggestion }: ChatEmptyStateProps) {
  return (
    <View style={{ flex: 1, paddingHorizontal: 24, alignItems: 'center', justifyContent: 'center' }}>
      <LinearGradient
        colors={['#6C5CE7', '#00D1FF']}
        style={{ width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}
      >
        <Text style={{ color: '#fff', fontSize: 32 }}>◎</Text>
      </LinearGradient>
      <Text style={{ color: '#fff', fontSize: 22, fontWeight: '800', letterSpacing: -0.5, textAlign: 'center' }}>
        Hey {name}, I'm MirAI
      </Text>
      <Text style={{ color: '#7B8496', fontSize: 14, lineHeight: 21, textAlign: 'center', marginTop: 8, marginBottom: 28 }}>
        Tell me how you feel or what you're craving. I'll remember it and find something that fits.
      </Text>

      <View style={{ width: '100%', gap: 10 }}>
        {SUGGESTIONS.map((suggestion) => (
          <TouchableOpacity key={suggestion} onPress={() => onSelectSuggestion(suggestion)} activeOpacity={0.8}>
            <View
              style={{
                backgroundColor: '#141826',
                borderRadius: 14,
                paddingHorizontal: 18,
                paddingVertical: 14,
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.06)',
              }}
            >
              <Text style={{ color: '#B8C1D1', fontSize: 14 }}>{suggestion}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  )
}
