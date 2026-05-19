// src/stores/auth.store.ts
import { create } from 'zustand'
import { type User } from '@supabase/supabase-js'
import { type UserProfile } from '@/types/user'

interface AuthState {
  user: User | null
  profile: UserProfile | null
  isOnboarded: boolean
  setUser: (user: User | null) => void
  setProfile: (profile: UserProfile | null) => void
  setIsOnboarded: (value: boolean) => void
  reset: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  profile: null,
  isOnboarded: false,
  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  setIsOnboarded: (isOnboarded) => set({ isOnboarded }),
  reset: () => set({ user: null, profile: null, isOnboarded: false }),
}))