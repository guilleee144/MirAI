// src/services/anilist.ts
// AniList GraphQL API — no API key required for public queries

const ANILIST_API = 'https://graphql.anilist.co'

async function anilistQuery<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
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