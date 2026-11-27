// src/features/library/constants.ts
import type { Database } from '@/types/supabase'

export type TrackingStatus = Database['public']['Enums']['tracking_status']
export type LibraryType = Database['public']['Enums']['content_type']
export type StatusFilter = 'all' | TrackingStatus

export const LIBRARY_TABS: { id: LibraryType; label: string; icon: string }[] = [
  { id: 'anime', label: 'Anime', icon: '▶' },
  { id: 'manga', label: 'Manga', icon: '📖' },
  { id: 'game', label: 'Games', icon: '🎮' },
]

export const STATUS_COLORS: Record<TrackingStatus, string> = {
  watching: '#00D1FF',
  completed: '#2EE59D',
  plan_to_watch: '#7B8496',
  on_hold: '#FFB347',
  dropped: '#FF6B6B',
}

// Same five statuses in the database; the wording changes with the content.
const STATUS_LABELS: Record<LibraryType, Record<TrackingStatus, string>> = {
  anime: { watching: 'Watching', completed: 'Completed', plan_to_watch: 'Plan to watch', on_hold: 'On hold', dropped: 'Dropped' },
  manga: { watching: 'Reading', completed: 'Completed', plan_to_watch: 'Plan to read', on_hold: 'On hold', dropped: 'Dropped' },
  game: { watching: 'Playing', completed: 'Completed', plan_to_watch: 'Backlog', on_hold: 'Paused', dropped: 'Dropped' },
}

export const STATUS_FILTER_ORDER: TrackingStatus[] = ['watching', 'completed', 'plan_to_watch', 'on_hold', 'dropped']

export function getStatusLabel(type: LibraryType, status: TrackingStatus | null): string {
  return STATUS_LABELS[type][status ?? 'plan_to_watch']
}

export const EMPTY_STATES: Record<
  LibraryType,
  { emoji: string; title: string; description: string; action: 'connect-anilist' | 'connect-steam' }
> = {
  anime: {
    emoji: '▶',
    title: 'No anime yet',
    description: 'Connect AniList to import your anime list, or discover something new.',
    action: 'connect-anilist',
  },
  manga: {
    emoji: '📖',
    title: 'No manga yet',
    description: 'Connect AniList to import your manga list, or discover something new.',
    action: 'connect-anilist',
  },
  game: {
    emoji: '🎮',
    title: 'No games yet',
    description: 'Connect your Steam account to import your games and playtime.',
    action: 'connect-steam',
  },
}
