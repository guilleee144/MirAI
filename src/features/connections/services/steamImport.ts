// src/features/connections/services/steamImport.ts
// Imports / re-syncs a Steam library into the `tracking` table. Used by the
// Connect Steam screen (first import) and the background sync (keeps hours fresh).
import { supabase } from '@/services/supabase'
import { fetchSteamLibrary, getSteamTrackingStatus, type SteamGame } from '@/services/steam'
import type { Database } from '@/types/supabase'

type TrackingInsert = Database['public']['Tables']['tracking']['Insert']

const TOP_GAMES_LIMIT = 20

/** The most played games, plus anything played in the last two weeks. */
export function selectGamesToImport(games: SteamGame[]): SteamGame[] {
  return games.filter((game, index) => index < TOP_GAMES_LIMIT || game.playtime_2weeks_hours > 0)
}

function toTrackingRow(userId: string, game: SteamGame): TrackingInsert {
  return {
    user_id: userId,
    content_type: 'game',
    external_id: game.appid.toString(),
    title: game.name,
    cover_image: game.cover_url,
    status: getSteamTrackingStatus(game),
    progress: game.playtime_hours,
    metadata: {
      steam_appid: game.appid,
      playtime_hours: game.playtime_hours,
      playtime_2weeks: game.playtime_2weeks_hours,
      achievements: game.achievements ?? null,
      is_multiplayer_only: game.is_multiplayer_only ?? null,
      source: 'steam',
    },
  }
}

async function upsertGames(userId: string, games: SteamGame[]): Promise<number> {
  const selected = selectGamesToImport(games)
  if (selected.length === 0) return 0

  const { error } = await supabase
    .from('tracking')
    .upsert(selected.map((game) => toTrackingRow(userId, game)), {
      onConflict: 'user_id,content_type,external_id',
    })
  if (error) throw new Error(error.message)

  return selected.length
}

/** First import: saves the games and remembers the SteamID (that is what "connected" means). */
export async function importSteamGames(userId: string, steamId: string, games: SteamGame[]): Promise<number> {
  const count = await upsertGames(userId, games)

  const { error } = await supabase
    .from('profiles')
    .update({ steam_id: steamId, updated_at: new Date().toISOString() })
    .eq('id', userId)
  if (error) throw new Error(error.message)

  return count
}

/** Background refresh: re-reads the library so hours, achievements and status stay current. */
export async function syncSteamLibrary(userId: string, steamId: string): Promise<void> {
  const library = await fetchSteamLibrary(steamId)
  await upsertGames(userId, library.games)
}

/** Forgets the link. Already imported games stay in the library. */
export async function disconnectSteam(userId: string): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update({ steam_id: null, updated_at: new Date().toISOString() })
    .eq('id', userId)
  if (error) throw new Error(error.message)
}
