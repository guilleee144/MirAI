// src/features/library/hooks/useLibraryData.ts
// Loads the user's library and keeps it fresh: whenever the screen is focused it loads
// what is stored AND (at most every 15 min, or on pull-to-refresh) re-syncs the linked
// Steam / AniList accounts at the same time, then reloads once with the new data.
import { useCallback, useRef, useState } from 'react'
import { useFocusEffect } from '@react-navigation/native'
import { useAuth } from '@/providers/AuthProvider'
import { supabase } from '@/services/supabase'
import { syncConnections } from '@/features/connections/services/syncConnections'
import type { TrackingItem } from '../libraryStats'

const SYNC_INTERVAL_MS = 15 * 60 * 1000

// Module scope on purpose: survives leaving and re-entering the tab,
// resets when the app restarts (so every launch syncs once).
let lastSync = { userId: '', at: 0 }

export function useLibraryData() {
  const { user } = useAuth()
  const userId = user?.id
  const [items, setItems] = useState<TrackingItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)
  const isSyncingRef = useRef(false)

  const load = useCallback(async () => {
    if (!userId) return
    const { data } = await supabase
      .from('tracking')
      .select('*')
      .eq('user_id', userId)
      // Stable order: updated_at changes on every sync, which made the grid jump around.
      .order('created_at', { ascending: false })
      .order('title', { ascending: true })
    setItems(data ?? [])
    setIsLoading(false)
  }, [userId])

  const sync = useCallback(
    async (force = false) => {
      if (!userId || isSyncingRef.current) return
      const isFresh = lastSync.userId === userId && Date.now() - lastSync.at < SYNC_INTERVAL_MS
      if (!force && isFresh) return

      isSyncingRef.current = true
      setIsSyncing(true)
      try {
        const result = await syncConnections(userId)
        lastSync = { userId, at: Date.now() }
        if (result.attempted > 0) await load()
      } finally {
        isSyncingRef.current = false
        setIsSyncing(false)
      }
    },
    [userId, load]
  )

  // Stored data and the background sync start together: nothing waits for the other.
  useFocusEffect(
    useCallback(() => {
      load()
      sync()
    }, [load, sync])
  )

  return { items, isLoading, isSyncing, refresh: () => sync(true) }
}
