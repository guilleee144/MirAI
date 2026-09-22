// src/app/navigation/OnboardingNavigator.tsx
// Mounted when session exists but the user's profile isn't onboarded yet
// (RootNavigator checks isOnboarded from AuthProvider/useAuthStore).
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import type { OnboardingStackParamList } from './types'
import { WelcomeScreen } from '@/features/onboarding/screens/WelcomeScreen'
import { TasteScreen } from '@/features/onboarding/screens/TasteScreen'
import { ConnectScreen } from '@/features/onboarding/screens/ConnectScreen'

const Stack = createNativeStackNavigator<OnboardingStackParamList>()

export function OnboardingNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Taste" component={TasteScreen} />
      <Stack.Screen name="Connect" component={ConnectScreen} />
    </Stack.Navigator>
  )
}
