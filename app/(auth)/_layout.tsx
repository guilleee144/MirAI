// app/(auth)/_layout.tsx
import { Stack } from 'expo-router'

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="onboarding/welcome" />
      <Stack.Screen name="onboarding/taste" />
      <Stack.Screen name="onboarding/connect" />
    </Stack>
  )
}