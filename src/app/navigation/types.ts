// src/app/navigation/types.ts
import type { NavigatorScreenParams } from '@react-navigation/native'

export type AuthStackParamList = {
  Login: undefined
  Register: undefined
}

export type OnboardingStackParamList = {
  Welcome: undefined
  Taste: undefined
  Connect: undefined
}

export type AppTabParamList = {
  Home: undefined
  Chat: undefined
  Discover: undefined
  Library: undefined
  Profile: undefined
}

export type AppStackParamList = {
  MainTabs: NavigatorScreenParams<AppTabParamList>
  MediaDetail: { id: string; type: string }
  ListAll: { type: string }
  EditProfile: undefined
  ConnectSteam: undefined
  ConnectAniList: undefined
}

// Only one of these three trees is ever mounted at a time — see
// RootNavigator, which picks between them based on session + isOnboarded.
// Merging them here just gives every screen type-checked navigation.
declare global {
  namespace ReactNavigation {
    interface RootParamList extends AppStackParamList, AuthStackParamList, OnboardingStackParamList {}
  }
}
