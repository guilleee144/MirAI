// src/providers/AuthProvider.tsx
import { createContext, useContext, useEffect, useState, type PropsWithChildren } from 'react'
import { useRouter, useSegments } from 'expo-router'
import { type Session, type User, type AuthChangeEvent } from '@supabase/supabase-js'
import { supabase } from '@/services/supabase'


interface AuthContextValue {
  session: Session | null
  user: User | null
  isLoading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const segments = useSegments()

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setIsLoading(false)
    })

    // Listen for auth changes
   const { data: { subscription } } = supabase.auth.onAuthStateChange(
  (_event: AuthChangeEvent, session: Session | null) => {
        setSession(session)
        setIsLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  // Route protection
useEffect(() => {
  if (isLoading) return

  const inAuthGroup = segments[0] === '(auth)'
  const inOnboarding = (segments as string[]).includes('onboarding')

  if (!session && !inAuthGroup) {
    router.replace('/(auth)/login' as any)
  } else if (session && inAuthGroup && !inOnboarding) {
    router.replace('/(app)' as any)
  }
}, [session, segments, isLoading])

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{ session, user: session?.user ?? null, isLoading, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}