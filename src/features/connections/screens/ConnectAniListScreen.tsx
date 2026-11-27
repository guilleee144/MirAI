// src/features/connections/screens/ConnectAniListScreen.tsx
// Links a public AniList profile (no OAuth): find the user, preview, import
// their anime + manga lists into the library. Mirrors ConnectSteamScreen.
import { useEffect, useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert, Image } from 'react-native'
import LinearGradient from 'react-native-linear-gradient'
import { useNavigation } from '@react-navigation/native'
import { useAuth } from '@/providers/AuthProvider'
import { supabase } from '@/services/supabase'
import { getAniListUser, parseAniListInput, type AniListUser } from '@/services/anilist'
import { importAniListLibrary, disconnectAniList } from '../services/anilistImport'

const ANILIST_BLUE = '#02A9FF'

export function ConnectAniListScreen() {
  const { user } = useAuth()
  const navigation = useNavigation()

  const [input, setInput] = useState('')
  const [connectedAs, setConnectedAs] = useState<string | null>(null)
  const [anilistUser, setAnilistUser] = useState<AniListUser | null>(null)
  const [isFinding, setIsFinding] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null)

  // Prefill with the account that is already linked, if any.
  useEffect(() => {
    if (!user) return
    supabase
      .from('profiles')
      .select('anilist_username')
      .eq('id', user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.anilist_username) {
          setConnectedAs(data.anilist_username)
          setInput(data.anilist_username)
        }
      })
  }, [user])

  const handleFind = async () => {
    const name = parseAniListInput(input)
    if (!name) {
      Alert.alert('Error', 'Please enter your AniList username or profile URL')
      return
    }

    setIsFinding(true)
    setAnilistUser(null)
    try {
      setAnilistUser(await getAniListUser(name))
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Could not find that AniList user.')
    } finally {
      setIsFinding(false)
    }
  }

  const handleImport = async () => {
    if (!user || !anilistUser) return
    setIsImporting(true)
    setProgress(null)

    try {
      const result = await importAniListLibrary(user.id, anilistUser.name, (done, total) =>
        setProgress({ done, total })
      )
      setConnectedAs(anilistUser.name)
      Alert.alert('AniList connected! 🎌', `${result.anime} anime and ${result.manga} manga imported to your library.`, [
        { text: 'OK', onPress: () => navigation.goBack() },
      ])
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Import failed. Please try again.')
    } finally {
      setIsImporting(false)
      setProgress(null)
    }
  }

  const handleDisconnect = () => {
    if (!user) return
    Alert.alert('Disconnect AniList?', 'Your imported titles will stay in your library.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Disconnect',
        style: 'destructive',
        onPress: async () => {
          try {
            await disconnectAniList(user.id)
            setConnectedAs(null)
            setAnilistUser(null)
            setInput('')
          } catch (e: any) {
            Alert.alert('Error', e.message)
          }
        },
      },
    ])
  }

  const totalEntries = anilistUser ? anilistUser.statistics.anime.count + anilistUser.statistics.manga.count : 0

  return (
    <View style={{ flex: 1, backgroundColor: '#0B0F17' }}>
      <LinearGradient
        colors={['rgba(2,169,255,0.1)', 'transparent']}
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
            <Text style={{ color: '#fff', fontSize: 22, fontWeight: '800', letterSpacing: -0.5 }}>Connect AniList</Text>
            <Text style={{ color: '#7B8496', fontSize: 13, marginTop: 2 }}>Import your anime & manga lists</Text>
          </View>
        </View>

        <View style={{ paddingHorizontal: 20 }}>
          {connectedAs && (
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'rgba(46,229,157,0.08)', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 12, marginBottom: 20, borderWidth: 1, borderColor: 'rgba(46,229,157,0.2)' }}>
              <Text style={{ color: '#2EE59D', fontSize: 13, fontWeight: '600', flex: 1 }} numberOfLines={1}>
                Connected as {connectedAs} ✓
              </Text>
              <TouchableOpacity onPress={handleDisconnect}>
                <Text style={{ color: '#7B8496', fontSize: 13 }}>Disconnect</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={{ backgroundColor: '#141826', borderRadius: 16, padding: 16, marginBottom: 24, borderWidth: 1, borderColor: 'rgba(2,169,255,0.2)' }}>
            <Text style={{ color: '#fff', fontSize: 14, fontWeight: '600', marginBottom: 6 }}>How it works</Text>
            <Text style={{ color: '#B8C1D1', fontSize: 13, lineHeight: 20 }}>
              Enter your AniList username or paste your profile link. MirAI reads your public lists, no password needed.{'\n\n'}
              If your list is private, set it to <Text style={{ color: ANILIST_BLUE }}>public</Text> in your AniList settings first.
            </Text>
          </View>

          <Text style={{ color: '#B8C1D1', fontSize: 13, fontWeight: '500', marginBottom: 8 }}>AniList username or profile URL</Text>
          <View style={{ flexDirection: 'row', gap: 10, marginBottom: 24 }}>
            <TextInput
              value={input}
              onChangeText={setInput}
              style={{ flex: 1, backgroundColor: '#141826', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14, color: '#fff', fontSize: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' }}
              placeholderTextColor="#7B8496"
              placeholder="username or anilist.co/user/..."
              autoCapitalize="none"
              autoCorrect={false}
              onSubmitEditing={handleFind}
              returnKeyType="search"
            />
            <TouchableOpacity onPress={handleFind} disabled={isFinding || isImporting} activeOpacity={0.85}>
              <LinearGradient colors={[ANILIST_BLUE, '#0284C7']} style={{ borderRadius: 14, paddingHorizontal: 20, paddingVertical: 14, alignItems: 'center', justifyContent: 'center' }}>
                {isFinding ? <ActivityIndicator color="#fff" size="small" /> : <Text style={{ color: '#fff', fontSize: 14, fontWeight: '600' }}>Find</Text>}
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {anilistUser && (
            <View style={{ backgroundColor: '#141826', borderRadius: 16, padding: 16, marginBottom: 24, borderWidth: 1, borderColor: 'rgba(2,169,255,0.3)' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                {anilistUser.avatar.large ? (
                  <Image source={{ uri: anilistUser.avatar.large }} style={{ width: 48, height: 48, borderRadius: 24 }} />
                ) : (
                  <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: '#1B2133' }} />
                )}
                <View style={{ flex: 1 }}>
                  <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }} numberOfLines={1}>
                    {anilistUser.name}
                  </Text>
                  <Text style={{ color: ANILIST_BLUE, fontSize: 13, marginTop: 2 }}>{totalEntries} titles on their lists</Text>
                </View>
                <View style={{ backgroundColor: 'rgba(46,229,157,0.12)', borderRadius: 100, paddingHorizontal: 12, paddingVertical: 5 }}>
                  <Text style={{ color: '#2EE59D', fontSize: 12, fontWeight: '600' }}>Found ✓</Text>
                </View>
              </View>

              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={{ flex: 1, backgroundColor: '#0B0F17', borderRadius: 12, padding: 12, alignItems: 'center' }}>
                  <Text style={{ color: '#6C5CE7', fontSize: 20, fontWeight: '800' }}>{anilistUser.statistics.anime.count}</Text>
                  <Text style={{ color: '#7B8496', fontSize: 11, marginTop: 2 }}>Anime</Text>
                </View>
                <View style={{ flex: 1, backgroundColor: '#0B0F17', borderRadius: 12, padding: 12, alignItems: 'center' }}>
                  <Text style={{ color: '#00D1FF', fontSize: 20, fontWeight: '800' }}>{anilistUser.statistics.manga.count}</Text>
                  <Text style={{ color: '#7B8496', fontSize: 11, marginTop: 2 }}>Manga</Text>
                </View>
              </View>
            </View>
          )}

          {anilistUser && (
            <TouchableOpacity onPress={handleImport} disabled={isImporting} activeOpacity={0.85}>
              <LinearGradient colors={['#6C5CE7', '#8B7FF0']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ borderRadius: 16, paddingVertical: 18, alignItems: 'center' }}>
                {isImporting ? (
                  <View style={{ alignItems: 'center', gap: 6 }}>
                    <ActivityIndicator color="#fff" />
                    {progress && progress.total > 0 && (
                      <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12 }}>
                        Importing {progress.done} / {progress.total}
                      </Text>
                    )}
                  </View>
                ) : (
                  <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>
                    {connectedAs === anilistUser.name ? 'Re-sync with MirAI' : 'Import to MirAI'}
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
