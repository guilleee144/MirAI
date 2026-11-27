// src/features/connections/services/syncConnections.ts
// Re-syncs every account the user has linked. Each source fails independently:
// a Steam outage must not block the AniList refresh (and vice versa).
import { supabase } from '@/services/supabase'
import { importAniListLibrary } from './anilistImport'
import { syncSteamLibrary } from './steamImport'

export interface SyncResult {
  /** How many linked accounts we tried to sync. */
  attempted: number
  failed: number
}

export async function syncConnections(userId: string): Promise<SyncResult> {
  const { data: profile } = await supabase
    .from('profiles')
    .select('steam_id, anilist_username')
    .eq('id', userId)
    .maybeSingle()

  const tasks: Promise<unknown>[] = []
  if (profile?.steam_id) tasks.push(syncSteamLibrary(userId, profile.steam_id))
  if (profile?.anilist_username) tasks.push(importAniListLibrary(userId, profile.anilist_username))

  const results = await Promise.allSettled(tasks)
  const failed = results.filter((r) => r.status === 'rejected')

  if (__DEV__) {
    for (const r of failed) console.warn('[sync] a connection failed to sync', (r as PromiseRejectedResult).reason)
  }

  return { attempted: tasks.length, failed: failed.length }
}
