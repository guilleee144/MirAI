// src/features/library/libraryStats.ts
// Pure helpers: no React, no I/O.
import type { Database } from '@/types/supabase'
import { getStatusLabel, STATUS_COLORS, type LibraryType } from './constants'

export type TrackingItem = Database['public']['Tables']['tracking']['Row']

export interface LibraryStat {
  label: string
  value: string
  color: string
}

/** Hours played for a game. Falls back to `progress`, which also stores hours. */
export function getPlaytimeHours(item: TrackingItem): number {
  const metadata = item.metadata as Record<string, unknown> | null
  const hours = metadata?.['playtime_hours']
  return typeof hours === 'number' ? hours : item.progress ?? 0
}

function formatHours(hours: number): string {
  return hours >= 1000 ? `${(hours / 1000).toFixed(1)}k` : String(Math.round(hours))
}

/** The four numbers shown above the grid, always about ONE content type. */
export function getLibraryStats(items: TrackingItem[], type: LibraryType): LibraryStat[] {
  const count = (status: TrackingItem['status']) => items.filter((i) => i.status === status).length

  if (type === 'game') {
    const totalHours = items.reduce((sum, item) => sum + getPlaytimeHours(item), 0)
    return [
      { label: 'Games', value: String(items.length), color: '#2EE59D' },
      { label: getStatusLabel(type, 'watching'), value: String(count('watching')), color: STATUS_COLORS.watching },
      { label: getStatusLabel(type, 'completed'), value: String(count('completed')), color: STATUS_COLORS.completed },
      { label: 'Hours', value: formatHours(totalHours), color: '#FFB347' },
    ]
  }

  return [
    { label: type === 'anime' ? 'Anime' : 'Manga', value: String(items.length), color: type === 'anime' ? '#6C5CE7' : '#00D1FF' },
    { label: getStatusLabel(type, 'watching'), value: String(count('watching')), color: STATUS_COLORS.watching },
    { label: getStatusLabel(type, 'completed'), value: String(count('completed')), color: STATUS_COLORS.completed },
    { label: getStatusLabel(type, 'plan_to_watch'), value: String(count('plan_to_watch')), color: '#B8C1D1' },
  ]
}
