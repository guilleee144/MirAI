// src/app/navigation/AppStack.tsx
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import type { AppStackParamList } from './types'
import { AppTabs } from './AppTabs'
import { MediaDetailScreen } from '@/features/media/screens/MediaDetailScreen'
import { ListScreen } from '@/features/discover/screens/ListScreen'
import { EditProfileScreen } from '@/features/profile/screens/EditProfileScreen'
import { ConnectSteamScreen } from '@/features/connections/screens/ConnectSteamScreen'
import { ConnectAniListScreen } from '@/features/connections/screens/ConnectAniListScreen'

const Stack = createNativeStackNavigator<AppStackParamList>()

export function AppStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={AppTabs} />
      <Stack.Screen name="MediaDetail" component={MediaDetailScreen} />
      <Stack.Screen name="ListAll" component={ListScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="ConnectSteam" component={ConnectSteamScreen} />
      <Stack.Screen name="ConnectAniList" component={ConnectAniListScreen} />
    </Stack.Navigator>
  )
}
