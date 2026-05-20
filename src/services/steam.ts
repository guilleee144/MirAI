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