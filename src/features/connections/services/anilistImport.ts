// src/features/connections/services/anilistImport.ts
// Pulls a public AniList user's anime + manga lists into the `tracking` table
// and remembers the username on the profile (that is what "connected" means).
import { supabase } from '@/services/supabase'
import { getUserMediaList, type AniListListEntry, type AniListListStatus } from '@/services/anilist'
import type { Database } from '@/types/supabase'

type TrackingInsert = Database['public']['Tables']['tracking']['Insert']
type TrackingStatus = NonNullable<TrackingInsert['status']>

const UPSERT_CHUNK_SIZE = 200

const STATUS_MAP: Record<AniListListStatus, TrackingStatus> = {
  CURRENT: 'watching',
  REPEATING: 'watching',
  COMPLETED: 'completed',
  PAUSED: 'on_hold',
  DROPPED: 'dropped',
  PLANNING: 'plan_to_watch',
}

function toTrackingRow(
  entry: AniListListEntry,
  contentType: 'anime' | 'manga',
  userId: string,
  anilistUsername: string
): TrackingInsert {
  return {
    user_id: userId,
    content_type: contentType,
    external_id: String(entry.media.id),
    title: entry.media.title.english ?? entry.media.title.romaji,
    cover_image: entry.media.coverImage.large,
    status: STATUS_MAP[entry.status],
    progress: entry.progress,
    // AniList uses 0 for "not rated". Rounded: the column may be an integer.
    rating: entry.score > 0 ? Math.round(entry.score) : null,
    metadata: { source: 'anilist', anilist_username: anilistUsername },
  }
}

export interface ImportResult {
  anime: number
  manga: number
}

export async function importAniListLibrary(
  userId: string,
  anilistUsername: string,
  onProgress?: (done: number, total: number) => void
): Promise<ImportResult> {
  const [animeEntries, mangaEntries] = await Promise.all([
    getUserMediaList(anilistUsername, 'ANIME'),
    getUserMediaList(anilistUsername, 'MANGA'),
  ])

  const rows: TrackingInsert[] = [
    ...animeEntries.map((e) => toTrackingRow(e, 'anime', userId, anilistUsername)),
    ...mangaEntries.map((e) => toTrackingRow(e, 'manga', userId, anilistUsername)),
  ]

  onProgress?.(0, rows.length)

  for (let i = 0; i < rows.length; i += UPSERT_CHUNK_SIZE) {
    const chunk = rows.slice(i, i + UPSERT_CHUNK_SIZE)
    const { error } = await supabase
      .from('tracking')
      .upsert(chunk, { onConflict: 'user_id,content_type,external_id' })
    if (error) throw new Error(error.message)
    onProgress?.(Math.min(i + UPSERT_CHUNK_SIZE, rows.length), rows.length)
  }

  const { error: profileError } = await supabase
    .from('profiles')
    .update({ anilist_username: anilistUsername, updated_at: new Date().toISOString() })
    .eq('id', userId)
  if (profileError) throw new Error(profileError.message)

  return { anime: animeEntries.length, manga: mangaEntries.length }
}

/** Forgets the link. Already imported titles stay in the library. */
export async function disconnectAniList(userId: string): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update({ anilist_username: null, updated_at: new Date().toISOString() })
    .eq('id', userId)
  if (error) throw new Error(error.message)
}
