// src/components/ui/ComingSoonScreen.tsx
//
// Temporary placeholder wired into every real navigator slot so the app
// compiles and runs end-to-end on rn-cli from day one. Each screen that
// renders this gets swapped for its real migrated content in the next
// pass — nothing about the navigation wiring changes when that happens.
import { View, Text } from 'react-native'
import { colors } from '@/theme/colors'

export function ComingSoonScreen({ title }: { title: string }) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.background.primary,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingHorizontal: 32,
      }}
    >
      <Text style={{ color: colors.text.primary, fontSize: 20, fontWeight: '700' }}>{title}</Text>
      <Text style={{ color: colors.text.tertiary, fontSize: 14, textAlign: 'center' }}>
        Migrando esta pantalla desde Expo — llega en el próximo paso.
      </Text>
    </View>
  )
}
