// src/features/discover/hooks/useSteamStore.ts
import { useMemo } from 'react'
import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { useDeviceRegion } from '@/hooks/useDeviceRegion'
import {
  buildStoreLocale,
  getStoreGameDetail,
  getStoreList,
  searchStoreGames,
  type GameListCategory,
  type StoreLocale,
} from '@/services/steamStore'

const ROW_SIZE = 12
const PAGE_SIZE = 30

/** Region settings for Steam requests: English content, prices in the phone's currency. */
export function useStoreLocale(): StoreLocale {
  const region = useDeviceRegion()
  return useMemo(() => buildStoreLocale(region), [region])
}

// The locale is part of every key so cached prices never leak across regions.
const localeKey = (locale: StoreLocale) => [locale.language, locale.mediaCountry, locale.priceCountry] as const

export const steamStoreKeys = {
  row: (category: GameListCategory, locale: StoreLocale) => ['steam-store', 'row', category, ...localeKey(locale)] as const,
  list: (category: GameListCategory, locale: StoreLocale) => ['steam-store', 'list', category, ...localeKey(locale)] as const,
  search: (term: string, locale: StoreLocale) => ['steam-store', 'search', term, ...localeKey(locale)] as const,
  detail: (id: number, locale: StoreLocale) => ['steam-store', 'detail', id, ...localeKey(locale)] as const,
}

/** First games of a category: the horizontal rows in Discover. */
export function useStoreRow(category: GameListCategory, enabled = true) {
  const locale = useStoreLocale()
  return useQuery({
    queryKey: steamStoreKeys.row(category, locale),
    queryFn: async () => (await getStoreList(category, locale, 0, ROW_SIZE)).games,
    enabled,
    staleTime: 1000 * 60 * 30,
  })
}

/** Whole category, loaded page by page: the "See all" screen. */
export function useStoreList(category: GameListCategory) {
  const locale = useStoreLocale()
  return useInfiniteQuery({
    queryKey: steamStoreKeys.list(category, locale),
    queryFn: ({ pageParam }) => getStoreList(category, locale, pageParam, PAGE_SIZE),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextStart ?? undefined,
    staleTime: 1000 * 60 * 30,
  })
}

export function useSearchGames(term: string) {
  const locale = useStoreLocale()
  return useQuery({
    queryKey: steamStoreKeys.search(term, locale),
    queryFn: () => searchStoreGames(term, locale),
    enabled: term.length >= 2,
    staleTime: 1000 * 60 * 10,
  })
}

export function useStoreGameDetail(id: number) {
  const locale = useStoreLocale()
  return useQuery({
    queryKey: steamStoreKeys.detail(id, locale),
    queryFn: () => getStoreGameDetail(id, locale),
    enabled: Number.isFinite(id),
    staleTime: 1000 * 60 * 60,
  })
}
