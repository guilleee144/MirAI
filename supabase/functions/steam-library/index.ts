// supabase/functions/steam-library/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

    return new Response(
      JSON.stringify({
        profile: player ? {
          steamid: player.steamid,
          username: player.personaname,
          avatar: player.avatarfull,
          profile_url: player.profileurl,
        } : null,
        game_count: gamesData.response.game_count,
        games,
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