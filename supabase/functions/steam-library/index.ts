// supabase/functions/steam-library/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Only the top games are enriched (one extra request each). Keep this in sync
// with the number of games the app imports.
const ENRICH_LIMIT = 20
const REQUEST_TIMEOUT_MS = 6000

type Achievements = { total: number; unlocked: number }

// Needs the player's "game details" to be public. null = unknown / no achievements.
async function fetchAchievements(apiKey: string, steamId: string, appid: number): Promise<Achievements | null> {
  try {
    const url = `https://api.steampowered.com/ISteamUserStats/GetPlayerAchievements/v0001/?appid=${appid}&key=${apiKey}&steamid=${steamId}`
    const res = await fetch(url, { signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) })
    if (!res.ok) return null
    const data = await res.json() as {
      playerstats?: { success?: boolean; achievements?: { achieved: number }[] }
    }
    const list = data.playerstats?.achievements
    if (!data.playerstats?.success || !list || list.length === 0) return null
    return { total: list.length, unlocked: list.filter((a) => a.achieved === 1).length }
  } catch {
    return null
  }
}

// true when the game is online/multiplayer with no single-player mode (Apex, MMOs, PvP...),
// i.e. a game that has no ending. null = could not be determined.
async function fetchIsMultiplayerOnly(appid: number): Promise<boolean | null> {
  try {
    const url = `https://store.steampowered.com/api/appdetails?appids=${appid}&filters=categories&l=english`
    const res = await fetch(url, { signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) })
    if (!res.ok) return null
    const data = await res.json() as Record<string, {
      success: boolean
      data?: { categories?: { description: string }[] }
    }>
    const entry = data[String(appid)]
    const categories = entry?.success ? entry.data?.categories : undefined
    if (!categories) return null
    const names = categories.map((c) => c.description)
    const hasSinglePlayer = names.some((n) => /^single-player$/i.test(n))
    const hasMultiplayer = names.some((n) => /multi-player|pvp|mmo|co-op/i.test(n))
    return hasMultiplayer && !hasSinglePlayer
  } catch {
    return null
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { steamId } = await req.json() as { steamId: string }

    if (!steamId) {
      return new Response(
        JSON.stringify({ error: 'steamId is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const STEAM_API_KEY = Deno.env.get('STEAM_API_KEY')
    console.log('Steam ID received:', steamId)
    console.log('API Key exists:', !!STEAM_API_KEY)
    if (!STEAM_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'Steam API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get owned games
    const gamesUrl = `https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/?key=${STEAM_API_KEY}&steamid=${steamId}&include_appinfo=true&include_played_free_games=true&format=json`
    const gamesRes = await fetch(gamesUrl)
    const gamesData = await gamesRes.json() as {
      response: {
        game_count: number
        games: {
          appid: number
          name: string
          playtime_forever: number
          img_icon_url: string
          playtime_2weeks?: number
        }[]
      }
    }

    if (!gamesData.response?.games) {
      return new Response(
        JSON.stringify({ error: 'Could not fetch games. Make sure your Steam profile is public.' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get player summary
    const profileUrl = `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${STEAM_API_KEY}&steamids=${steamId}&format=json`
    const profileRes = await fetch(profileUrl)
    const profileData = await profileRes.json() as {
      response: {
        players: {
          steamid: string
          personaname: string
          avatarfull: string
          profileurl: string
        }[]
      }
    }

    const player = profileData.response.players[0]

    // Sort by playtime and take top 50
    const games = gamesData.response.games
      .sort((a, b) => b.playtime_forever - a.playtime_forever)
      .slice(0, 50)
      .map(game => ({
        appid: game.appid,
        name: game.name,
        playtime_hours: Math.round(game.playtime_forever / 60),
        playtime_2weeks_hours: game.playtime_2weeks ? Math.round(game.playtime_2weeks / 60) : 0,
        cover_url: `https://cdn.akamai.steamstatic.com/steam/apps/${game.appid}/header.jpg`,
        icon_url: game.img_icon_url
          ? `https://media.steampowered.com/steamcommunity/public/images/apps/${game.appid}/${game.img_icon_url}.jpg`
          : null,
      }))

    const enrichedGames = await Promise.all(
      games.map(async (game, index) => {
        // The app imports the top games plus anything played in the last 2 weeks.
        if (index >= ENRICH_LIMIT && game.playtime_2weeks_hours === 0) return game
        const [achievements, isMultiplayerOnly] = await Promise.all([
          fetchAchievements(STEAM_API_KEY, steamId, game.appid),
          fetchIsMultiplayerOnly(game.appid),
        ])
        return { ...game, achievements, is_multiplayer_only: isMultiplayerOnly }
      })
    )

    return new Response(
      JSON.stringify({
        profile: player ? {
          steamid: player.steamid,
          username: player.personaname,
          avatar: player.avatarfull,
          profile_url: player.profileurl,
        } : null,
        game_count: gamesData.response.game_count,
        games: enrichedGames,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})