// src/features/discover/hooks/useSteamStore.ts
import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { getStoreGameDetail, getStoreList, searchStoreGames, type GameListCategory } from '@/services/steamStore'

const ROW_SIZE = 12
const PAGE_SIZE = 30

export const steamStoreKeys = {
  row: (category: GameListCategory) => ['steam-store', 'row', category] as const,
  list: (category: GameListCategory) => ['steam-store', 'list', category] as const,
  search: (term: string) => ['steam-store', 'search', term] as const,
  detail: (id: number) => ['steam-store', 'detail', id] as const,
}

/** First games of a category: the horizontal rows in Discover. */
export function useStoreRow(category: GameListCategory, enabled = true) {
  return useQuery({
    queryKey: steamStoreKeys.row(category),
    queryFn: async () => (await getStoreList(category, 0, ROW_SIZE)).games,
    enabled,
    staleTime: 1000 * 60 * 30,
  })
}

/** Whole category, loaded page by page: the "See all" screen. */
export function useStoreList(category: GameListCategory) {
  return useInfiniteQuery({
    queryKey: steamStoreKeys.list(category),
    queryFn: ({ pageParam }) => getStoreList(category, pageParam, PAGE_SIZE),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextStart ?? undefined,
    staleTime: 1000 * 60 * 30,
  })
}

export function useSearchGames(term: string) {
  return useQuery({
    queryKey: steamStoreKeys.search(term),
    queryFn: () => searchStoreGames(term),
    enabled: term.length >= 2,
    staleTime: 1000 * 60 * 10,
  })
}

export function useStoreGameDetail(id: number) {
  return useQuery({
    queryKey: steamStoreKeys.detail(id),
    queryFn: () => getStoreGameDetail(id),
    enabled: Number.isFinite(id),
    staleTime: 1000 * 60 * 60,
  })
}
