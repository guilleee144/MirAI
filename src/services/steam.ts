// src/services/steam.ts
import { supabase } from './supabase'

export interface SteamProfile {
  steamid: string
  username: string
  avatar: string
  profile_url: string
}

export interface SteamGame {
  appid: number
  name: string
  playtime_hours: number
  playtime_2weeks_hours: number
  cover_url: string
  icon_url: string | null
  /** Only present for the most played games. null = unknown / game has no achievements. */
  achievements?: { total: number; unlocked: number } | null
  /** true = online/multiplayer-only game with no ending. null = unknown. */
  is_multiplayer_only?: boolean | null
  /** Store genres (Action, RPG...). Only present for the most played games. */
  genres?: string[] | null
}

export interface SteamLibraryResponse {
  profile: SteamProfile | null
  game_count: number
  games: SteamGame[]
}

export async function fetchSteamLibrary(steamId: string): Promise<SteamLibraryResponse> {
  const { data, error } = await supabase.functions.invoke('steam-library', {
    body: { steamId },
  })

  if (error) throw new Error(error.message)
  if (data.error) throw new Error(data.error)

  return data as SteamLibraryResponse
}

// Helper: extract Steam ID from profile URL or vanity name
export function parseSteamInput(input: string): string {
  const trimmed = input.trim()

  // Already a Steam ID (17 digit number)
  if (/^\d{17}$/.test(trimmed)) return trimmed

  // URL format: steamcommunity.com/profiles/76561198XXXXXXXXX
  const profileMatch = trimmed.match(/profiles\/(\d{17})/)
  if (profileMatch?.[1]) return profileMatch[1]

  // Return as-is if vanity URL — we'll need to resolve it separately
  return trimmed
}

export type SteamTrackingStatus = 'completed' | 'watching' | 'on_hold' | 'plan_to_watch'

/**
 * Library status for a Steam game.
 * - Never played            -> plan_to_watch (shown as "Backlog")
 * - 100% achievements       -> completed (unless it is a multiplayer-only game)
 * - Otherwise               -> watching ("Playing") if played in the last 2 weeks,
 *                              on_hold ("Paused") if not
 * A game is never "completed" just because it has playtime.
 */
export function getSteamTrackingStatus(game: SteamGame): SteamTrackingStatus {
  const played = game.playtime_hours > 0 || game.playtime_2weeks_hours > 0
  if (!played) return 'plan_to_watch'

  const hasAllAchievements =
    !!game.achievements && game.achievements.total > 0 && game.achievements.unlocked === game.achievements.total
  if (hasAllAchievements && !game.is_multiplayer_only) return 'completed'

  return game.playtime_2weeks_hours > 0 ? 'watching' : 'on_hold'
}
