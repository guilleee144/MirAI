// src/providers/AuthProvider.tsx
//
// Owns session + onboarding state and keeps useAuthStore (Zustand) in sync
// as the single source of truth other parts of the app can read from
// outside React (e.g. non-component code) without needing this context.
// RootNavigator reads session/isOnboarded from here to pick a navigator tree.
import { createContext, useContext, useEffect, useState, type PropsWithChildren } from 'react'
import { type Session, type User, type AuthChangeEvent } from '@supabase/supabase-js'
import { supabase } from '@/services/supabase'
import { useAuthStore } from '@/stores/auth.store'

interface AuthContextValue {
  session: Session | null
  user: User | null
  isLoading: boolean
  isOnboarded: boolean
  signOut: () => Promise<void>
  /** Call after the onboarding flow's last step succeeds — flips state
   * immediately instead of waiting on a re-fetch, so RootNavigator swaps
   * to AppStack without a flicker. */
  markOnboarded: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isOnboarded, setIsOnboarded] = useState(false)
  const setStoreUser = useAuthStore((s) => s.setUser)
  const setStoreOnboarded = useAuthStore((s) => s.setIsOnboarded)
  const resetStore = useAuthStore((s) => s.reset)

  useEffect(() => {
    let isMounted = true

    async function syncSession(nextSession: Session | null) {
      setSession(nextSession)
      setStoreUser(nextSession?.user ?? null)

      if (!nextSession) {
        setIsOnboarded(false)
        setStoreOnboarded(false)
        setIsLoading(false)
        return
      }

      const { data } = await supabase
        .from('profiles')
        .select('is_onboarded')
        .eq('id', nextSession.user.id)
        .single()

      if (!isMounted) return
      const onboarded = Boolean((data as { is_onboarded?: boolean } | null)?.is_onboarded)
      setIsOnboarded(onboarded)
      setStoreOnboarded(onboarded)
      setIsLoading(false)
    }

    supabase.auth.getSession().then(({ data: { session } }) => syncSession(session))

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, nextSession: Session | null) => {
      syncSession(nextSession)
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [setStoreUser, setStoreOnboarded])

  const signOut = async () => {
    await supabase.auth.signOut()
    resetStore()
  }

  const markOnboarded = () => {
    setIsOnboarded(true)
    setStoreOnboarded(true)
  }

  return (
    <AuthContext.Provider
      value={{
        session,
        user: session?.user ?? null,
        isLoading,
        isOnboarded,
        signOut,
        markOnboarded,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
