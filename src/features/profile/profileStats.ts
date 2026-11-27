// src/features/profile/profileStats.ts
// Pure helpers behind the Profile screen: XP, level, rank and taste radars.
// No React, no I/O: everything is derived from the user's library, so XP and
// taste follow AniList / Steam syncs on their own and can never drift.
import type { Database } from '@/types/supabase'
import type { RadarDatum } from '@/components/ui/TasteRadar'

export type { RadarDatum }

type TrackingRow = Database['public']['Tables']['tracking']['Row']

/** The only tracking columns the profile needs. */
export type ProfileItem = Pick<TrackingRow, 'content_type' | 'status' | 'progress' | 'rating' | 'metadata'>

// ── XP ────────────────────────────────────────────────────────────────────────

export const XP_RULES = {
  episode: 10,
  chapter: 4,
  gameHour: 15,
  completed: 100, // any anime / manga / game (a game counts as completed at 100% achievements)
  rated: 10,
} as const

export interface XpSource {
  /** What was counted: episodes, chapters or hours. */
  amount: number
  completed: number
  xp: number
}

export interface XpSummary {
  total: number
  anime: XpSource
  manga: XpSource
  games: XpSource
}

export function getGameHours(item: ProfileItem): number {
  const metadata = item.metadata as Record<string, unknown> | null
  const hours = metadata?.['playtime_hours']
  return typeof hours === 'number' ? hours : item.progress ?? 0
}

export function computeXp(items: ProfileItem[]): XpSummary {
  const sources = {
    anime: { amount: 0, completed: 0, xp: 0 },
    manga: { amount: 0, completed: 0, xp: 0 },
    games: { amount: 0, completed: 0, xp: 0 },
  }

  for (const item of items) {
    const source = item.content_type === 'anime' ? sources.anime : item.content_type === 'manga' ? sources.manga : sources.games
    const amount = item.content_type === 'game' ? getGameHours(item) : Math.max(item.progress ?? 0, 0)
    const perUnit = item.content_type === 'anime' ? XP_RULES.episode : item.content_type === 'manga' ? XP_RULES.chapter : XP_RULES.gameHour

    source.amount += amount
    source.xp += amount * perUnit
    if (item.status === 'completed') {
      source.completed += 1
      source.xp += XP_RULES.completed
    }
    if (item.rating && item.rating > 0) source.xp += XP_RULES.rated
  }

  for (const source of Object.values(sources)) source.xp = Math.round(source.xp)
  return { total: sources.anime.xp + sources.manga.xp + sources.games.xp, ...sources }
}

// ── Level ─────────────────────────────────────────────────────────────────────

const MAX_LEVEL = 99

/** XP needed to go from `level` to the next one: 500, 750, 1000, ... */
export function xpToNextLevel(level: number): number {
  return 500 + (level - 1) * 250
}

export interface LevelInfo {
  level: number
  /** XP earned inside the current level. */
  xpIntoLevel: number
  /** XP the current level needs to be completed. */
  xpForNext: number
}

export function getLevelInfo(totalXp: number): LevelInfo {
  let level = 1
  let remaining = Math.max(totalXp, 0)
  while (level < MAX_LEVEL && remaining >= xpToNextLevel(level)) {
    remaining -= xpToNextLevel(level)
    level += 1
  }
  return { level, xpIntoLevel: remaining, xpForNext: xpToNextLevel(level) }
}

const RANKS: { fromLevel: number; title: string }[] = [
  { fromLevel: 30, title: 'Legend' },
  { fromLevel: 20, title: 'Master' },
  { fromLevel: 15, title: 'Veteran' },
  { fromLevel: 10, title: 'Otaku' },
  { fromLevel: 6, title: 'Enthusiast' },
  { fromLevel: 3, title: 'Rookie' },
  { fromLevel: 1, title: 'Newcomer' },
]

export function getRank(level: number): string {
  return RANKS.find((rank) => level >= rank.fromLevel)?.title ?? 'Newcomer'
}

// ── Taste radars ──────────────────────────────────────────────────────────────

export interface TasteData {
  animeManga: RadarDatum[]
  games: RadarDatum[]
  /** "activity" = built from the lists, "onboarding" = from the genres picked at sign-up. */
  animeMangaSource: 'activity' | 'onboarding'
}

const RADAR_AXES = 6
const MIN_AXES = 3
const MIN_VALUE = 12 // keeps the weakest axis visible on the chart

const STATUS_WEIGHT: Record<NonNullable<ProfileItem['status']>, number> = {
  completed: 1,
  watching: 0.8,
  on_hold: 0.4,
  plan_to_watch: 0.15,
  dropped: 0.1,
}

// Steam tags software and store labels as "genres": they say nothing about taste.
const IGNORED_GAME_GENRES = new Set([
  'free to play',
  'early access',
  'utilities',
  'software training',
  'education',
  'design & illustration',
  'video production',
  'audio production',
  'animation & modeling',
  'photo editing',
  'web publishing',
  'game development',
  'accounting',
  'movie',
  'documentary',
  'episodic',
  'short',
  'tutorial',
])

function readGenres(item: ProfileItem): string[] {
  const metadata = item.metadata as Record<string, unknown> | null
  const genres = metadata?.['genres']
  return Array.isArray(genres) ? genres.filter((genre): genre is string => typeof genre === 'string') : []
}

function toRadar(scores: Map<string, number>): RadarDatum[] {
  const top = [...scores.entries()].sort((a, b) => b[1] - a[1]).slice(0, RADAR_AXES)
  const max = top[0]?.[1] ?? 0
  if (max <= 0) return []
  return top.map(([label, score]) => ({ label, value: Math.max(Math.round((score / max) * 100), MIN_VALUE) }))
}

function addScore(scores: Map<string, number>, genre: string, weight: number) {
  scores.set(genre, (scores.get(genre) ?? 0) + weight)
}

/** Completed and well-rated titles say more about taste than abandoned ones. */
function animeMangaWeight(item: ProfileItem): number {
  const status = STATUS_WEIGHT[item.status ?? 'plan_to_watch']
  const rating = item.rating ?? 0
  const ratingFactor = rating >= 8 ? 1.3 : rating > 0 && rating <= 5 ? 0.6 : 1
  return status * ratingFactor
}

/**
 * @param onboardingGenres genres picked at sign-up: used for the anime/manga chart
 * until the lists have enough genre data.
 */
export function computeTaste(items: ProfileItem[], onboardingGenres: Record<string, number>): TasteData {
  const animeManga = new Map<string, number>()
  const games = new Map<string, number>()

  for (const item of items) {
    const genres = readGenres(item)
    if (genres.length === 0) continue

    if (item.content_type === 'game') {
      // log scale: 400h in one game must not erase everything else you play.
      const weight = Math.log1p(getGameHours(item))
      if (weight <= 0) continue
      for (const genre of genres) {
        if (!IGNORED_GAME_GENRES.has(genre.toLowerCase())) addScore(games, genre, weight)
      }
    } else {
      const weight = animeMangaWeight(item)
      for (const genre of genres) addScore(animeManga, genre, weight)
    }
  }

  const fromActivity = toRadar(animeManga)
  if (fromActivity.length >= MIN_AXES) {
    return { animeManga: fromActivity, games: toRadar(games), animeMangaSource: 'activity' }
  }

  const fromOnboarding = toRadar(new Map(Object.entries(onboardingGenres)))
  return {
    animeManga: fromOnboarding.length >= MIN_AXES ? fromOnboarding : [],
    games: toRadar(games),
    animeMangaSource: 'onboarding',
  }
}

export function hasRadar(data: RadarDatum[]): boolean {
  return data.length >= MIN_AXES
}

/** Rows imported before genres were stored: the next sync will fill them in. */
export function isMissingGenres(item: ProfileItem): boolean {
  const metadata = item.metadata as Record<string, unknown> | null
  if (!metadata) return false
  const source = metadata['source']
  return (source === 'anilist' || source === 'steam') && !('genres' in metadata)
}
