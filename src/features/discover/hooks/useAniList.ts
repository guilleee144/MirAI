// src/features/discover/hooks/useAniList.ts
import { useQuery, useInfiniteQuery } from '@tanstack/react-query'
import {
  getTrendingAnime,
  getTrendingManga,
  getTopAnime,
  searchMedia,
  getMediaByGenre,
  getMediaById,
  getSeasonalAnime,
  getCurrentSeason,
} from '@/services/anilist'

// Query keys
export const anilistKeys = {
  all: ['anilist'] as const,
  trending: (type: 'anime' | 'manga') => ['anilist', 'trending', type] as const,
  top: () => ['anilist', 'top'] as const,
  search: (query: string, type: 'ANIME' | 'MANGA') => ['anilist', 'search', query, type] as const,
  genre: (genre: string, type: 'ANIME' | 'MANGA') => ['anilist', 'genre', genre, type] as const,
  media: (id: number) => ['anilist', 'media', id] as const,
  seasonal: (season: string, year: number) => ['anilist', 'seasonal', season, year] as const,
}

// Trending anime
export function useTrendingAnime(perPage = 10) {
  return useQuery({
    queryKey: anilistKeys.trending('anime'),
    queryFn: () => getTrendingAnime(1, perPage),
    staleTime: 1000 * 60 * 15, // 15 min
  })
}

// Trending manga
export function useTrendingManga(perPage = 10) {
  return useQuery({
    queryKey: anilistKeys.trending('manga'),
    queryFn: () => getTrendingManga(1, perPage),
    staleTime: 1000 * 60 * 15,
  })
}

// Top anime
export function useTopAnime(perPage = 10) {
  return useQuery({
    queryKey: anilistKeys.top(),
    queryFn: () => getTopAnime(1, perPage),
    staleTime: 1000 * 60 * 30, // 30 min — top changes slowly
  })
}

// Search with debounce handled by the component
export function useSearchMedia(search: string, type: 'ANIME' | 'MANGA') {
  return useQuery({
    queryKey: anilistKeys.search(search, type),
    queryFn: () => searchMedia(search, type),
    enabled: search.length >= 2, // only search if 2+ chars
    staleTime: 1000 * 60 * 5,
  })
}

// By genre
export function useMediaByGenre(genre: string, type: 'ANIME' | 'MANGA') {
  return useQuery({
    queryKey: anilistKeys.genre(genre, type),
    queryFn: () => getMediaByGenre(genre, type),
    enabled: !!genre,
    staleTime: 1000 * 60 * 15,
  })
}

// Single media detail
export function useMediaById(id: number) {
  return useQuery({
    queryKey: anilistKeys.media(id),
    queryFn: () => getMediaById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 30,
  })
}

// Current season
export function useCurrentSeason() {
  const { season, year } = getCurrentSeason()
  return useQuery({
    queryKey: anilistKeys.seasonal(season, year),
    queryFn: () => getSeasonalAnime(season, year, 1, 20),
    staleTime: 1000 * 60 * 30,
  })
}