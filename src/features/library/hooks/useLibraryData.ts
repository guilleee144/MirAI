// src/features/library/hooks/useLibraryData.ts
// Loads the user's library and keeps it fresh: whenever the screen is focused it
// shows what is stored, then (at most every 15 min, or on pull-to-refresh) re-syncs
// the linked Steam / AniList accounts in the background and reloads.
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
      .order('updated_at', { ascending: false })
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

  // Show stored data first (no spinner on re-focus), then refresh in the background.
  useFocusEffect(
    useCallback(() => {
      load().then(() => sync())
    }, [load, sync])
  )

  return { items, isLoading, isSyncing, refresh: () => sync(true) }
}
