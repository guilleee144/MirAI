// src/services/supabase.ts
import { createClient } from '@supabase/supabase-js'
import AsyncStorage from '@react-native-async-storage/async-storage'
import Config from 'react-native-config'
import type { Database } from '../types/supabase'

// Migration note: Expo exposed env vars via process.env.EXPO_PUBLIC_*,
// inlined at bundle time. react-native-config reads them from a native
// .env file at runtime instead — rename the keys in your .env from
// EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY to
// SUPABASE_URL / SUPABASE_ANON_KEY (no prefix needed, nothing is public
// by default — it's bundled into the native binary either way, so treat
// it the same as before: fine for the anon key, never for a service key).
const supabaseUrl = Config.SUPABASE_URL!
const supabaseAnonKey = Config.SUPABASE_ANON_KEY!

if (__DEV__ && (!supabaseUrl || !supabaseAnonKey)) {
  console.warn(
    '[supabase] Missing SUPABASE_URL / SUPABASE_ANON_KEY — check your .env and that ' +
      'react-native-config is linked natively (see android/app/build.gradle).'
  )
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})
