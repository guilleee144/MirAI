// src/services/steamStore.ts
// Public Steam Store endpoints: no API key, no Edge Function. Read-only catalogue data
// (lists, search, game details) for the Discover tab.
const STORE_URL = 'https://store.steampowered.com'
const COUNTRY = 'es' // decides regional prices
const CURRENCY = 'EUR' // currency Steam uses for COUNTRY
const LANGUAGE = 'english'

export type GameListCategory = 'topsellers' | 'new' | 'specials' | 'upcoming'

export const GAME_LIST_CONFIG: Record<GameListCategory, { title: string; subtitle: string; query: string }> = {
  topsellers: { title: 'Top Sellers', subtitle: 'Best selling on Steam right now', query: 'filter=topsellers' },
  new: { title: 'New & Trending', subtitle: 'Fresh releases people are playing', query: 'filter=popularnew' },
  specials: { title: 'On Sale', subtitle: 'Games with a discount today', query: 'specials=1' },
  upcoming: { title: 'Coming Soon', subtitle: 'Most anticipated upcoming games', query: 'filter=popularcomingsoon' },
}

export interface StoreGame {
  id: number
  name: string
  /** Best guess for the cover. Use `imageSources` to render (it falls back if one fails). */
  image: string
  imageSources: string[]
  /** Formatted price, "Free" for free-to-play, null when unknown (e.g. coming soon). */
  price: string | null
  discountPercent: number
}

export interface StoreScreenshot {
  thumb: string
  full: string
}

export interface StoreTrailer {
  thumbnail: string
  videoUrl: string
  /** Stream format, needed by the native player to pick the right decoder. */
  videoType: 'm3u8' | 'mpd' | 'mp4'
}

export interface StoreGameDetail {
  id: number
  name: string
  image: string
  imageSources: string[]
  description: string
  genres: string[]
  developers: string[]
  releaseDate: string | null
  comingSoon: boolean
  metacriticScore: number | null
  price: string | null
  discountPercent: number
  screenshots: StoreScreenshot[]
  trailer: StoreTrailer | null
}

export interface StoreListPage {
  games: StoreGame[]
  /** `start` for the next page, or null when the list is finished. */
  nextStart: number | null
}

// ── Filtering: hardware and non-games must not show up in a games catalogue ───

const EXCLUDED_APP_IDS = new Set([
  1675200, // Steam Deck
  4165890, // Steam Frame
  4165910, // Steam Machine
  4165870, // Steam Controller
  353370, // Steam Controller (old)
  353380, // Steam Link
  250820, // SteamVR
])
const EXCLUDED_NAME = /^steam (deck|machine|frame|controller|link|vr)\b|soundtrack/i

function isCatalogueGame(id: number, name: string): boolean {
  return !EXCLUDED_APP_IDS.has(id) && !EXCLUDED_NAME.test(name)
}

// ── Images ────────────────────────────────────────────────────────────────────

/**
 * Candidate cover URLs, best first. Steam has moved cover art between CDN paths over the
 * years, so no single URL works for every game: the UI tries them in order (see GameImage).
 * Capsule URLs from Steam responses contain the current hashed path, so swapping the file
 * name for `header.jpg` gives the full-size cover at the right location.
 */
export function buildImageSources(appId: number | string, ...known: (string | null | undefined)[]): string[] {
  const urls: string[] = []
  const add = (url: string | null | undefined) => {
    if (url && !urls.includes(url)) urls.push(url)
  }
  const real = known.filter((url): url is string => !!url)
  for (const url of real) add(url.replace(/\/capsule_[a-z0-9_]+\.jpg/i, '/header.jpg'))
  real.forEach(add)
  add(`https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${appId}/header.jpg`)
  add(`https://cdn.akamai.steamstatic.com/steam/apps/${appId}/header.jpg`)
  add(`https://cdn.cloudflare.steamstatic.com/steam/apps/${appId}/header.jpg`)
  return urls
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const CURRENCY_SYMBOLS: Record<string, string> = { EUR: '€', USD: '$', GBP: '£' }

function formatPrice(cents: number | undefined | null, currency: string = CURRENCY): string | null {
  if (cents === undefined || cents === null) return null
  if (cents === 0) return 'Free'
  const amount = (cents / 100).toFixed(2)
  const symbol = CURRENCY_SYMBOLS[currency]
  if (!symbol) return `${amount} ${currency}`
  return currency === 'EUR' ? `${amount}${symbol}` : `${symbol}${amount}`
}

function decodeEntities(text: string): string {
  return text
    .replace(/<[^>]*>/g, '')
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&trade;/g, '™')
    .replace(/&reg;/g, '®')
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCharCode(Number(code)))
    .trim()
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url)
  if (!response.ok) throw new Error(`Steam Store request failed (${response.status})`)
  return (await response.json()) as T
}

// ── Lists (Top Sellers, New & Trending, On Sale, Coming Soon) ─────────────────
// Steam's search endpoint returns the rows as an HTML fragment. It is the only public
// source that is paginated AND carries prices, so we read the few attributes we need.

interface RawSearchPage {
  success?: number
  results_html?: string
  total_count?: number
}

function parseSearchRows(html: string): { games: StoreGame[]; rowCount: number } {
  const rowTag = /<a\b[^>]*search_result_row[^>]*>/g
  const rows: { index: number; end: number; tag: string }[] = []
  for (let match = rowTag.exec(html); match !== null; match = rowTag.exec(html)) {
    rows.push({ index: match.index, end: match.index + match[0].length, tag: match[0] })
  }

  const games: StoreGame[] = []
  const seen = new Set<number>()

  rows.forEach((row, i) => {
    // Bundles have a "Bundle_…" item key and no app id: skip them.
    const appId = /data-ds-itemkey="App_(\d+)"/.exec(row.tag)?.[1]
    if (!appId) return
    const id = Number(appId)
    if (seen.has(id)) return

    const segment = html.slice(row.end, i + 1 < rows.length ? rows[i + 1].index : html.length)
    const name = decodeEntities(/<span class="title">([\s\S]*?)<\/span>/.exec(segment)?.[1] ?? '')
    if (!name || !isCatalogueGame(id, name)) return

    const finalCents = /data-price-final="(\d+)"/.exec(segment)?.[1]
    const discount = /data-discount="(\d+)"/.exec(segment)?.[1]
    const isFree = !finalCents && />\s*Free(?: to Play)?\s*</i.test(segment)
    const capsule = /<img[^>]+src="([^"]+)"/.exec(segment)?.[1]

    seen.add(id)
    const imageSources = buildImageSources(id, capsule)
    games.push({
      id,
      name,
      image: imageSources[0],
      imageSources,
      price: finalCents ? formatPrice(Number(finalCents)) : isFree ? 'Free' : null,
      discountPercent: discount ? Number(discount) : 0,
    })
  })

  return { games, rowCount: rows.length }
}

export async function getStoreList(category: GameListCategory, start = 0, count = 30): Promise<StoreListPage> {
  const { query } = GAME_LIST_CONFIG[category]
  // category1=998 → "Games" only (no DLC, soundtracks, software or hardware).
  const url =
    `${STORE_URL}/search/results/?query&${query}&category1=998` +
    `&start=${start}&count=${count}&cc=${COUNTRY}&l=${LANGUAGE}&infinite=1`

  const raw = await fetchJson<RawSearchPage>(url)
  if (!raw.success || typeof raw.results_html !== 'string') throw new Error('Unexpected Steam Store response')

  const { games, rowCount } = parseSearchRows(raw.results_html)
  if (games.length === 0 && start === 0) throw new Error('Steam Store returned no games')

  // Rows we skip (bundles, hardware) still count towards the offset.
  const nextStart = start + rowCount
  const hasMore = typeof raw.total_count === 'number' ? nextStart < raw.total_count : rowCount > 0
  return { games, nextStart: hasMore && rowCount > 0 ? nextStart : null }
}

// ── Search ────────────────────────────────────────────────────────────────────

interface RawSearchItem {
  id: number
  name: string
  type?: string
  tiny_image?: string
  price?: { final?: number; initial?: number; currency?: string }
}

export async function searchStoreGames(term: string): Promise<StoreGame[]> {
  const raw = await fetchJson<{ items?: RawSearchItem[] }>(
    `${STORE_URL}/api/storesearch/?term=${encodeURIComponent(term)}&l=${LANGUAGE}&cc=${COUNTRY}`
  )
  return (raw.items ?? [])
    .filter((item) => typeof item.id === 'number' && !!item.name && isCatalogueGame(item.id, item.name))
    .map((item) => {
      const final = item.price?.final
      const initial = item.price?.initial
      const imageSources = buildImageSources(item.id, item.tiny_image)
      return {
        id: item.id,
        name: item.name,
        image: imageSources[0],
        imageSources,
        // No price object: free demo or unreleased game, so we show nothing rather than guess.
        price: item.price ? formatPrice(final, item.price.currency) : null,
        discountPercent: initial && final !== undefined && initial > final ? Math.round(((initial - final) / initial) * 100) : 0,
      }
    })
}

// ── Detail ────────────────────────────────────────────────────────────────────

interface RawAppDetails {
  name: string
  short_description?: string
  header_image?: string
  is_free?: boolean
  genres?: { description: string }[]
  developers?: string[]
  release_date?: { coming_soon?: boolean; date?: string }
  metacritic?: { score?: number }
  price_overview?: { final?: number; currency?: string; discount_percent?: number }
  screenshots?: { path_thumbnail?: string; path_full?: string }[]
  movies?: {
    thumbnail?: string
    hls_h264?: string
    dash_h264?: string
    // Older responses used direct files instead of streams.
    mp4?: Record<string, string>
    webm?: Record<string, string>
  }[]
}

function toHttps(url: string): string {
  return url.replace(/^http:\/\//, 'https://')
}

/**
 * First trailer we can play. Steam now serves trailers as HLS / DASH streams (the player
 * adapts quality to the connection); direct mp4 files are kept as a fallback for old data.
 */
function pickTrailer(movies: RawAppDetails['movies']): StoreTrailer | null {
  for (const movie of movies ?? []) {
    if (!movie.thumbnail) continue
    const thumbnail = toHttps(movie.thumbnail)
    if (movie.hls_h264) return { thumbnail, videoUrl: toHttps(movie.hls_h264), videoType: 'm3u8' }
    if (movie.dash_h264) return { thumbnail, videoUrl: toHttps(movie.dash_h264), videoType: 'mpd' }
    const file = movie.mp4?.['480'] ?? movie.mp4?.max
    if (file) return { thumbnail, videoUrl: toHttps(file), videoType: 'mp4' }
  }
  return null
}

export async function getStoreGameDetail(appId: number): Promise<StoreGameDetail | null> {
  const raw = await fetchJson<Record<string, { success: boolean; data?: RawAppDetails }>>(
    `${STORE_URL}/api/appdetails?appids=${appId}&l=${LANGUAGE}&cc=${COUNTRY}`
  )
  const entry = raw[String(appId)]
  if (!entry?.success || !entry.data) return null

  const data = entry.data
  const imageSources = buildImageSources(appId, data.header_image)
  return {
    id: appId,
    name: data.name,
    image: imageSources[0],
    imageSources,
    description: decodeEntities(data.short_description ?? ''),
    genres: (data.genres ?? []).map((genre) => genre.description),
    developers: data.developers ?? [],
    releaseDate: data.release_date?.date || null,
    comingSoon: !!data.release_date?.coming_soon,
    metacriticScore: data.metacritic?.score ?? null,
    price: data.is_free ? 'Free' : formatPrice(data.price_overview?.final, data.price_overview?.currency),
    discountPercent: data.price_overview?.discount_percent ?? 0,
    screenshots: (data.screenshots ?? [])
      .filter((shot) => shot.path_full)
      .map((shot) => ({ thumb: toHttps(shot.path_thumbnail ?? shot.path_full!), full: toHttps(shot.path_full!) })),
    trailer: pickTrailer(data.movies),
  }
}
