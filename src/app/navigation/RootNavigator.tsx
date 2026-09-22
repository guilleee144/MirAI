// src/app/navigation/RootNavigator.tsx
//
// Three-way switch instead of the old useSegments() redirect effect:
//   no session          -> AuthNavigator (Login/Register)
//   session, not onboarded -> OnboardingNavigator (Welcome/Taste/Connect)
//   session, onboarded  -> AppStack (tabs + push screens)
// Each transition is just React re-rendering a different tree — no
// imperative router.replace() calls scattered across screens.
import { NavigationContainer, DarkTheme, type Theme } from '@react-navigation/native'
import { ActivityIndicator, View } from 'react-native'
import { useAuth } from '@/providers/AuthProvider'
import { AuthNavigator } from './AuthNavigator'
import { OnboardingNavigator } from './OnboardingNavigator'
import { AppStack } from './AppStack'
import { colors } from '@/theme/colors'

const navigationTheme: Theme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: colors.background.primary,
    card: colors.background.surface,
    primary: colors.primary.DEFAULT,
    text: colors.text.primary,
    border: colors.border.DEFAULT,
  },
}

export function RootNavigator() {
  const { session, isLoading, isOnboarded } = useAuth()

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.background.primary,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <ActivityIndicator color={colors.primary.DEFAULT} size="large" />
      </View>
    )
  }

  return (
    <NavigationContainer theme={navigationTheme}>
      {!session ? <AuthNavigator /> : !isOnboarded ? <OnboardingNavigator /> : <AppStack />}
    </NavigationContainer>
  )
}
