// app/(auth)/onboarding/connect.tsx
import { useState } from 'react'
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { useRouter } from 'expo-router'
import { supabase } from '@/services/supabase'
import { useAuth } from '@/providers/AuthProvider'

const CONNECTIONS = [
  {
    id: 'anilist',
    name: 'AniList',
    desc: 'Sync your anime & manga history',
    color: '#02A9FF',
    bg: 'rgba(2,169,255,0.1)',
    border: 'rgba(2,169,255,0.25)',
    initials: 'AL',
  },
  {
    id: 'mal',
    name: 'MyAnimeList',
    desc: 'Import your MAL list',
    color: '#2E51A2',
    bg: 'rgba(46,81,162,0.1)',
    border: 'rgba(46,81,162,0.25)',
    initials: 'MAL',
  },
  {
    id: 'steam',
    name: 'Steam',
    desc: 'Sync your game library',
    color: '#1B9FFF',
    bg: 'rgba(27,159,255,0.1)',
    border: 'rgba(27,159,255,0.25)',
    initials: 'ST',
  },
]

export default function ConnectScreen() {
  const router = useRouter()
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [connected, setConnected] = useState<string[]>([])

  const handleConnect = (id: string) => {
    // Will implement OAuth flows later
    setConnected(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    )
  }

  const handleFinish = async () => {
    if (!user) return
    setIsLoading(true)

    const { error } = await supabase
      .from('profiles')
      .update({ is_onboarded: true })
      .eq('id', user.id)

    setIsLoading(false)

    if (error) {
      console.error(error)
    }

    router.replace('/(app)')
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#0B0F17' }}>
      <LinearGradient
        colors={['rgba(0,209,255,0.08)', 'transparent']}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 300 }}
      />

      <View style={{ flex: 1, paddingTop: 64, paddingHorizontal: 24 }}>

        {/* Header */}
        <View style={{ marginBottom: 40 }}>
          <Text style={{ color: '#7B8496', fontSize: 13, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>
            Step 2 of 2
          </Text>
          <Text style={{ color: '#fff', fontSize: 32, fontWeight: '800', letterSpacing: -1, marginBottom: 8 }}>
            Connect your accounts
          </Text>
          <Text style={{ color: '#B8C1D1', fontSize: 15, lineHeight: 22 }}>
            Optional but powerful. MirAI learns from your existing history to give you better recommendations from day one.
          </Text>
        </View>

        {/* Connection cards */}
        <View style={{ gap: 12, marginBottom: 40 }}>
          {CONNECTIONS.map((conn) => {
            const isConnected = connected.includes(conn.id)
            return (
              <TouchableOpacity
                key={conn.id}
                onPress={() => handleConnect(conn.id)}
                activeOpacity={0.8}
              >
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: 20,
                  borderRadius: 16,
                  backgroundColor: isConnected ? conn.bg : '#141826',
                  borderWidth: 1,
                  borderColor: isConnected ? conn.border : 'rgba(255,255,255,0.06)',
                }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                    {/* Avatar */}
                    <View style={{
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      backgroundColor: conn.bg,
                      borderWidth: 1,
                      borderColor: conn.border,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <Text style={{ color: conn.color, fontSize: 11, fontWeight: '700' }}>
                        {conn.initials}
                      </Text>
                    </View>
                    <View>
                      <Text style={{ color: '#fff', fontSize: 15, fontWeight: '600' }}>
                        {conn.name}
                      </Text>
                      <Text style={{ color: '#7B8496', fontSize: 13, marginTop: 2 }}>
                        {conn.desc}
                      </Text>
                    </View>
                  </View>

                  {/* Status */}
                  <View style={{
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 100,
                    backgroundColor: isConnected ? 'rgba(46,229,157,0.15)' : 'rgba(255,255,255,0.06)',
                  }}>
                    <Text style={{
                      fontSize: 12,
                      fontWeight: '600',
                      color: isConnected ? '#2EE59D' : '#7B8496',
                    }}>
                      {isConnected ? 'Connected' : 'Connect'}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            )
          })}
        </View>

        {/* Skip note */}
        <Text style={{ color: '#7B8496', fontSize: 13, textAlign: 'center', marginBottom: 24, lineHeight: 20 }}>
          You can always connect these later in your profile settings.
        </Text>

        {/* Finish button */}
        <TouchableOpacity onPress={handleFinish} disabled={isLoading} activeOpacity={0.85}>
          <LinearGradient
            colors={['#6C5CE7', '#8B7FF0']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ borderRadius: 16, paddingVertical: 18, alignItems: 'center' }}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>
                {connected.length > 0 ? 'Finish & enter MirAI →' : 'Skip for now →'}
              </Text>
            )}
          </LinearGradient>
        </TouchableOpacity>

      </View>
    </View>
  )
}