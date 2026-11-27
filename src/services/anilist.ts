// src/services/anilist.ts
// AniList GraphQL API — no API key required for public queries

const ANILIST_API = 'https://graphql.anilist.co'

export async function anilistQuery<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
  const response = await fetch(ANILIST_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({ query, variables }),
  })

  if (!response.ok) {
    throw new Error(`AniList API error: ${response.status}`)
  }

  const json = await response.json() as { data: T; errors?: { message: string }[] }

  if (json.errors?.length) {
    throw new Error(json.errors[0]?.message ?? 'AniList query failed')
  }

  return json.data
}

// ─── Types ───────────────────────────────────────────────────

export interface AniListMedia {
  id: number
  title: {
    romaji: string
    english: string | null
    native: string
  }
  description: string | null
  genres: string[]
  tags: { name: string; rank: number }[]
  coverImage: {
    large: string
    extraLarge: string
    color: string | null
  }
  bannerImage: string | null
  averageScore: number | null
  popularity: number
  status: 'FINISHED' | 'RELEASING' | 'NOT_YET_RELEASED' | 'CANCELLED' | 'HIATUS'
  episodes: number | null
  chapters: number | null
  volumes: number | null
  season: 'WINTER' | 'SPRING' | 'SUMMER' | 'FALL' | null
  seasonYear: number | null
  format: 'TV' | 'TV_SHORT' | 'MOVIE' | 'SPECIAL' | 'OVA' | 'ONA' | 'MUSIC' | 'MANGA' | 'NOVEL' | 'ONE_SHOT' | null
  studios: {
    nodes: { name: string }[]
  }
  trailer: {
    id: string
    site: string
  } | null
  type: 'ANIME' | 'MANGA'
}

export interface AniListPageInfo {
  total: number
  currentPage: number
  lastPage: number
  hasNextPage: boolean
}

// ─── Fragments ───────────────────────────────────────────────

const MEDIA_FRAGMENT = `
  id
  title { romaji english native }
  description(asHtml: false)
  genres
  tags { name rank }
  coverImage { large extraLarge color }
  bannerImage
  averageScore
  popularity
  status
  episodes
  chapters
  volumes
  season
  seasonYear
  format
  type
  studios(isMain: true) { nodes { name } }
  trailer { id site }
`

// ─── Queries ─────────────────────────────────────────────────

// Trending anime
export async function getTrendingAnime(page = 1, perPage = 20) {
  const query = `
    query TrendingAnime($page: Int, $perPage: Int) {
      Page(page: $page, perPage: $perPage) {
        pageInfo { total currentPage lastPage hasNextPage }
        media(type: ANIME, sort: TRENDING_DESC, status_in: [RELEASING, FINISHED]) {
          ${MEDIA_FRAGMENT}
        }
      }
    }
  `
  const data = await anilistQuery<{ Page: { pageInfo: AniListPageInfo; media: AniListMedia[] } }>(
    query, { page, perPage }
  )
  return data.Page
}

// Trending manga
export async function getTrendingManga(page = 1, perPage = 20) {
  const query = `
    query TrendingManga($page: Int, $perPage: Int) {
      Page(page: $page, perPage: $perPage) {
        pageInfo { total currentPage lastPage hasNextPage }
        media(type: MANGA, sort: TRENDING_DESC) {
          ${MEDIA_FRAGMENT}
        }
      }
    }
  `
  const data = await anilistQuery<{ Page: { pageInfo: AniListPageInfo; media: AniListMedia[] } }>(
    query, { page, perPage }
  )
  return data.Page
}

// Top rated anime all time
export async function getTopAnime(page = 1, perPage = 20) {
  const query = `
    query TopAnime($page: Int, $perPage: Int) {
      Page(page: $page, perPage: $perPage) {
        pageInfo { total currentPage lastPage hasNextPage }
        media(type: ANIME, sort: SCORE_DESC, status_in: [FINISHED, RELEASING]) {
          ${MEDIA_FRAGMENT}
        }
      }
    }
  `
  const data = await anilistQuery<{ Page: { pageInfo: AniListPageInfo; media: AniListMedia[] } }>(
    query, { page, perPage }
  )
  return data.Page
}

// Search anime or manga
export async function searchMedia(
  search: string,
  type: 'ANIME' | 'MANGA',
  page = 1,
  perPage = 20
) {
  const query = `
    query SearchMedia($search: String, $type: MediaType, $page: Int, $perPage: Int) {
      Page(page: $page, perPage: $perPage) {
        pageInfo { total currentPage lastPage hasNextPage }
        media(search: $search, type: $type) {
          ${MEDIA_FRAGMENT}
        }
      }
    }
  `
  const data = await anilistQuery<{ Page: { pageInfo: AniListPageInfo; media: AniListMedia[] } }>(
    query, { search, type, page, perPage }
  )
  return data.Page
}

// Get media by genre
export async function getMediaByGenre(
  genre: string,
  type: 'ANIME' | 'MANGA',
  page = 1,
  perPage = 20
) {
  const query = `
    query MediaByGenre($genre: String, $type: MediaType, $page: Int, $perPage: Int) {
      Page(page: $page, perPage: $perPage) {
        pageInfo { total currentPage lastPage hasNextPage }
        media(genre: $genre, type: $type, sort: SCORE_DESC) {
          ${MEDIA_FRAGMENT}
        }
      }
    }
  `
  const data = await anilistQuery<{ Page: { pageInfo: AniListPageInfo; media: AniListMedia[] } }>(
    query, { genre, type, page, perPage }
  )
  return data.Page
}

// Get single media by ID
export async function getMediaById(id: number) {
  const query = `
    query MediaById($id: Int) {
      Media(id: $id) {
        ${MEDIA_FRAGMENT}
        recommendations(sort: RATING_DESC, perPage: 10) {
          nodes {
            mediaRecommendation {
              ${MEDIA_FRAGMENT}
            }
          }
        }
      }
    }
  `
  const data = await anilistQuery<{ Media: AniListMedia & {
    recommendations: {
      nodes: { mediaRecommendation: AniListMedia }[]
    }
  } }>(query, { id })
  return data.Media
}

// Get seasonal anime
export async function getSeasonalAnime(
  season: 'WINTER' | 'SPRING' | 'SUMMER' | 'FALL',
  year: number,
  page = 1,
  perPage = 20
) {
  const query = `
    query SeasonalAnime($season: MediaSeason, $year: Int, $page: Int, $perPage: Int) {
      Page(page: $page, perPage: $perPage) {
        pageInfo { total currentPage lastPage hasNextPage }
        media(type: ANIME, season: $season, seasonYear: $year, sort: POPULARITY_DESC) {
          ${MEDIA_FRAGMENT}
        }
      }
    }
  `
  const data = await anilistQuery<{ Page: { pageInfo: AniListPageInfo; media: AniListMedia[] } }>(
    query, { season, year, page, perPage }
  )
  return data.Page
}

// Helper: get current season
export function getCurrentSeason(): { season: 'WINTER' | 'SPRING' | 'SUMMER' | 'FALL'; year: number } {
  const month = new Date().getMonth() + 1
  const year = new Date().getFullYear()
  const season =
    month <= 3 ? 'WINTER' :
    month <= 6 ? 'SPRING' :
    month <= 9 ? 'SUMMER' : 'FALL'
  return { season, year }
}

// Helper: format score
export function formatScore(score: number | null): string {
  if (!score) return 'N/A'
  return (score / 10).toFixed(1)
}

// Helper: get display title
export function getTitle(media: AniListMedia): string {
  return media.title.english ?? media.title.romaji
}

// ─── User lists (public, no auth) ────────────────────────────

export interface AniListUser {
  id: number
  name: string
  avatar: { large: string | null }
  statistics: {
    anime: { count: number }
    manga: { count: number }
  }
}

export type AniListListStatus = 'CURRENT' | 'PLANNING' | 'COMPLETED' | 'DROPPED' | 'PAUSED' | 'REPEATING'

export interface AniListListEntry {
  status: AniListListStatus
  /** 0-10 (we ask AniList to normalise every user's score format). 0 = unrated. */
  score: number
  progress: number
  media: {
    id: number
    title: { romaji: string; english: string | null }
    coverImage: { large: string | null }
    genres: string[]
  }
}

export class AniListUserError extends Error {
  constructor(public readonly code: 'not_found' | 'private' | 'unknown', message: string) {
    super(message)
    this.name = 'AniListUserError'
  }
}

function toUserError(error: unknown): AniListUserError {
  const message = error instanceof Error ? error.message : String(error)
  if (/404|not found/i.test(message)) {
    return new AniListUserError('not_found', "We couldn't find that AniList user. Check the username.")
  }
  if (/private/i.test(message)) {
    return new AniListUserError('private', 'That list is private. Make it public in your AniList settings and try again.')
  }
  return new AniListUserError('unknown', 'Could not reach AniList. Please try again.')
}

/** Accepts "name", "@name" or a profile URL like https://anilist.co/user/name/ */
export function parseAniListInput(input: string): string {
  const trimmed = input.trim().replace(/^@/, '')
  const urlMatch = trimmed.match(/anilist\.co\/user\/([^/?#\s]+)/i)
  return (urlMatch?.[1] ?? trimmed).trim()
}

export async function getAniListUser(name: string): Promise<AniListUser> {
  const query = `
    query AniListUser($name: String) {
      User(name: $name) {
        id
        name
        avatar { large }
        statistics {
          anime { count }
          manga { count }
        }
      }
    }
  `
  try {
    const data = await anilistQuery<{ User: AniListUser | null }>(query, { name })
    if (!data.User) throw new AniListUserError('not_found', "We couldn't find that AniList user. Check the username.")
    return data.User
  } catch (error) {
    throw error instanceof AniListUserError ? error : toUserError(error)
  }
}

/** Every entry of a user's list for one media type, de-duplicated by media id. */
export async function getUserMediaList(userName: string, type: 'ANIME' | 'MANGA'): Promise<AniListListEntry[]> {
  const query = `
    query UserMediaList($userName: String, $type: MediaType) {
      MediaListCollection(userName: $userName, type: $type) {
        lists {
          isCustomList
          entries {
            status
            score(format: POINT_10_DECIMAL)
            progress
            media {
              id
              title { romaji english }
              coverImage { large }
              genres
            }
          }
        }
      }
    }
  `
  try {
    const data = await anilistQuery<{
      MediaListCollection: { lists: { isCustomList: boolean; entries: AniListListEntry[] }[] } | null
    }>(query, { userName, type })

    // Custom lists repeat entries already present in the status lists.
    const byMediaId = new Map<number, AniListListEntry>()
    for (const list of data.MediaListCollection?.lists ?? []) {
      if (list.isCustomList) continue
      for (const entry of list.entries) byMediaId.set(entry.media.id, entry)
    }
    return [...byMediaId.values()]
  } catch (error) {
    throw error instanceof AniListUserError ? error : toUserError(error)
  }
}
