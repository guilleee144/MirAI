// src/features/connections/screens/ConnectSteamScreen.tsx
// Migrated from app/(app)/connect-steam/index.tsx. Now also remembers the SteamID
// on the profile so the library can keep playtime up to date.
import { useEffect, useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert, Image } from 'react-native'
import LinearGradient from 'react-native-linear-gradient'
import { useNavigation } from '@react-navigation/native'
import { useAuth } from '@/providers/AuthProvider'
import { supabase } from '@/services/supabase'
import { fetchSteamLibrary, parseSteamInput, type SteamGame, type SteamProfile } from '@/services/steam'
import { disconnectSteam, importSteamGames, selectGamesToImport } from '../services/steamImport'

export function ConnectSteamScreen() {
  const { user } = useAuth()
  const navigation = useNavigation()

  const [steamInput, setSteamInput] = useState('')
  const [connectedSteamId, setConnectedSteamId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [steamProfile, setSteamProfile] = useState<SteamProfile | null>(null)
  const [games, setGames] = useState<SteamGame[]>([])
  const [gameCount, setGameCount] = useState(0)

  // Prefill with the account that is already linked, if any.
  useEffect(() => {
    if (!user) return
    supabase
      .from('profiles')
      .select('steam_id')
      .eq('id', user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.steam_id) {
          setConnectedSteamId(data.steam_id)
          setSteamInput(data.steam_id)
        }
      })
  }, [user])

  const gamesToImport = selectGamesToImport(games)

  const handleFetch = async () => {
    if (!steamInput.trim()) {
      Alert.alert('Error', 'Please enter your Steam ID or profile URL')
      return
    }

    setIsLoading(true)
    setSteamProfile(null)
    setGames([])

    try {
      const steamId = parseSteamInput(steamInput)
      const data = await fetchSteamLibrary(steamId)
      setSteamProfile(data.profile)
      setGames(data.games)
      setGameCount(data.game_count)
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Could not fetch Steam library. Make sure your profile is public.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    if (!user || !steamProfile) return
    setIsSaving(true)

    try {
      const imported = await importSteamGames(user.id, steamProfile.steamid, games)
      setConnectedSteamId(steamProfile.steamid)

      Alert.alert('Steam connected! 🎮', `${imported} games imported to your library. Playtime stays in sync automatically.`, [
        { text: 'OK', onPress: () => navigation.goBack() },
      ])
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Import failed. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDisconnect = () => {
    if (!user) return
    Alert.alert('Disconnect Steam?', 'Your imported games will stay in your library, but hours will stop updating.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Disconnect',
        style: 'destructive',
        onPress: async () => {
          try {
            await disconnectSteam(user.id)
            setConnectedSteamId(null)
            setSteamProfile(null)
            setGames([])
            setSteamInput('')
          } catch (e: any) {
            Alert.alert('Error', e.message)
          }
        },
      },
    ])
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#0B0F17' }}>
      <LinearGradient
        colors={['rgba(27,159,255,0.1)', 'transparent']}
        pointerEvents="none"
        style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 250 }}
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
        <View style={{ paddingHorizontal: 20, paddingTop: 56, paddingBottom: 24, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#141826', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center' }}
          >
            <Text style={{ color: '#fff', fontSize: 16 }}>←</Text>
          </TouchableOpacity>
          <View>
            <Text style={{ color: '#fff', fontSize: 22, fontWeight: '800', letterSpacing: -0.5 }}>Connect Steam</Text>
            <Text style={{ color: '#7B8496', fontSize: 13, marginTop: 2 }}>Import your game library</Text>
          </View>
        </View>

        <View style={{ paddingHorizontal: 20 }}>
          {connectedSteamId && (
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'rgba(46,229,157,0.08)', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 12, marginBottom: 20, borderWidth: 1, borderColor: 'rgba(46,229,157,0.2)' }}>
              <Text style={{ color: '#2EE59D', fontSize: 13, fontWeight: '600', flex: 1 }} numberOfLines={1}>
                Steam connected ✓
              </Text>
              <TouchableOpacity onPress={handleDisconnect}>
                <Text style={{ color: '#7B8496', fontSize: 13 }}>Disconnect</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={{ backgroundColor: '#141826', borderRadius: 16, padding: 16, marginBottom: 24, borderWidth: 1, borderColor: 'rgba(27,159,255,0.2)' }}>
            <Text style={{ color: '#fff', fontSize: 14, fontWeight: '600', marginBottom: 6 }}>How to find your Steam ID</Text>
            <Text style={{ color: '#B8C1D1', fontSize: 13, lineHeight: 20 }}>
              1. Open Steam → your profile{'\n'}
              2. Copy the URL from your browser{'\n'}
              3. Paste it below{'\n\n'}
              Set your profile and <Text style={{ color: '#1B9FFF' }}>game details</Text> to Public in Steam privacy settings, otherwise games and achievements can't be read.
            </Text>
          </View>

          <Text style={{ color: '#B8C1D1', fontSize: 13, fontWeight: '500', marginBottom: 8 }}>Steam ID or profile URL</Text>
          <View style={{ flexDirection: 'row', gap: 10, marginBottom: 24 }}>
            <TextInput
              value={steamInput}
              onChangeText={setSteamInput}
              style={{ flex: 1, backgroundColor: '#141826', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14, color: '#fff', fontSize: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' }}
              placeholderTextColor="#7B8496"
              placeholder="76561198XXXXXXXXX or steamcommunity.com/id/..."
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity onPress={handleFetch} disabled={isLoading} activeOpacity={0.85}>
              <LinearGradient colors={['#1B9FFF', '#0077CC']} style={{ borderRadius: 14, paddingHorizontal: 20, paddingVertical: 14, alignItems: 'center', justifyContent: 'center' }}>
                {isLoading ? <ActivityIndicator color="#fff" size="small" /> : <Text style={{ color: '#fff', fontSize: 14, fontWeight: '600' }}>Find</Text>}
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {steamProfile && (
            <View style={{ backgroundColor: '#141826', borderRadius: 16, padding: 16, marginBottom: 24, borderWidth: 1, borderColor: 'rgba(27,159,255,0.3)' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <Image source={{ uri: steamProfile.avatar }} style={{ width: 48, height: 48, borderRadius: 24 }} />
                <View>
                  <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>{steamProfile.username}</Text>
                  <Text style={{ color: '#1B9FFF', fontSize: 13, marginTop: 2 }}>{gameCount} games in library</Text>
                </View>
                <View style={{ marginLeft: 'auto', backgroundColor: 'rgba(46,229,157,0.12)', borderRadius: 100, paddingHorizontal: 12, paddingVertical: 5 }}>
                  <Text style={{ color: '#2EE59D', fontSize: 12, fontWeight: '600' }}>Found ✓</Text>
                </View>
              </View>

              <Text style={{ color: '#7B8496', fontSize: 12, marginBottom: 10 }}>Top games by playtime</Text>
              {games.slice(0, 5).map((game) => (
                <View key={game.appid} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <Image source={{ uri: game.cover_url }} style={{ width: 48, height: 22, borderRadius: 4 }} resizeMode="cover" />
                  <Text style={{ flex: 1, color: '#B8C1D1', fontSize: 13 }} numberOfLines={1}>
                    {game.name}
                  </Text>
                  <Text style={{ color: '#7B8496', fontSize: 12 }}>{game.playtime_hours}h</Text>
                </View>
              ))}
              {gamesToImport.length > 5 && (
                <Text style={{ color: '#7B8496', fontSize: 12, marginTop: 4 }}>
                  +{gamesToImport.length - 5} more games will be imported
                </Text>
              )}
            </View>
          )}

          {steamProfile && (
            <TouchableOpacity onPress={handleSave} disabled={isSaving} activeOpacity={0.85}>
              <LinearGradient colors={['#6C5CE7', '#8B7FF0']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ borderRadius: 16, paddingVertical: 18, alignItems: 'center' }}>
                {isSaving ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>
                    {connectedSteamId === steamProfile.steamid ? 'Re-sync' : `Import ${gamesToImport.length} games to MirAI`}
                  </Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </View>
  )
}
