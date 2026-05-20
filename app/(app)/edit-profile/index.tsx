// app/(app)/edit-profile/index.tsx
import { useState, useEffect } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { useRouter } from 'expo-router'
import * as ImagePicker from 'expo-image-picker'
import { useAuth } from '@/providers/AuthProvider'
import { supabase } from '@/services/supabase'
import type { Database } from '@/types/supabase'

type Profile = Database['public']['Tables']['profiles']['Row']

const MOODS = [
  { id: 'energetic', label: 'Energetic', color: '#FFB347' },
  { id: 'calm', label: 'Calm', color: '#00D1FF' },
  { id: 'excited', label: 'Excited', color: '#6C5CE7' },
  { id: 'intense', label: 'Intense', color: '#FF6B6B' },
  { id: 'happy', label: 'Happy', color: '#2EE59D' },
  { id: 'melancholic', label: 'Melancholic', color: '#7B8496' },
] as const

export default function EditProfileScreen() {
  const { user } = useAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false)

  const [username, setUsername] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [bio, setBio] = useState('')
  const [selectedMood, setSelectedMood] = useState<string | null>(null)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return
    loadProfile()
  }, [user])

  const loadProfile = async () => {
    if (!user) return
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (data) {
      setUsername(data.username ?? '')
      setDisplayName(data.display_name ?? '')
      setBio(data.bio ?? '')
      setSelectedMood(data.current_mood ?? null)
      setAvatarUrl(data.avatar_url ? `${data.avatar_url}?t=${Date.now()}` : null)
    }
    setIsLoading(false)
  }

  const handlePickPhoto = async () => {
// Borrar avatar anterior
const { data: existingFiles } = await supabase.storage
  .from('avatars')
  .list(user!.id)

if (existingFiles && existingFiles.length > 0) {
  const filesToDelete = existingFiles.map(f => `${user!.id}/${f.name}`)
  await supabase.storage.from('avatars').remove(filesToDelete)
}

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    })

    if (result.canceled || !result.assets[0]) return

    const asset = result.assets[0]
    if (!asset.uri) return

setIsUploadingPhoto(true)

try {
  const fileExt = asset.uri.split('.').pop()?.toLowerCase() ?? 'jpg'
const fileName = `${user!.id}/avatar_${Date.now()}.${fileExt}`
  const contentType = `image/${fileExt === 'jpg' ? 'jpeg' : fileExt}`

  // React Native forma correcta de subir archivos
  const formData = new FormData()
  formData.append('file', {
    uri: asset.uri,
    name: `avatar.${fileExt}`,
    type: contentType,
  } as any)

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(fileName, formData, {
      contentType: contentType,
      upsert: true,
    })

  if (uploadError) {
    Alert.alert('Upload error', uploadError.message)
    return
  }

  const { data: urlData } = supabase.storage
    .from('avatars')
    .getPublicUrl(fileName)

  const publicUrl = urlData.publicUrl

  await supabase
    .from('profiles')
    .update({ avatar_url: publicUrl })
    .eq('id', user!.id)


  setAvatarUrl(`${publicUrl}?t=${Date.now()}`)
  Alert.alert('Success', 'Photo updated!')

} catch (e) {
  console.error(e)
  Alert.alert('Error', 'Failed to upload photo. Please try again.')
} finally {
  setIsUploadingPhoto(false)
}
  }

  const handleSave = async () => {
    if (!user) return
    if (!username.trim()) {
      Alert.alert('Error', 'Username cannot be empty')
      return
    }

    setIsSaving(true)

    const { error } = await supabase
      .from('profiles')
      .update({
        username: username.trim(),
        display_name: displayName.trim() || username.trim(),
        bio: bio.trim() || null,
        current_mood: selectedMood as Profile['current_mood'],
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)

    setIsSaving(false)

    if (error) {
      Alert.alert('Error', error.message)
      return
    }

    router.back()
  }

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0B0F17', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color="#6C5CE7" size="large" />
      </View>
    )
  }

  const username_initial = username.charAt(0).toUpperCase()

  return (
    <View style={{ flex: 1, backgroundColor: '#0B0F17' }}>
      <LinearGradient
        colors={['rgba(108,92,231,0.12)', 'transparent']}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 250 }}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={{ paddingHorizontal: 20, paddingTop: 56, paddingBottom: 24, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#141826', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center' }}
          >
            <Text style={{ color: '#fff', fontSize: 16 }}>←</Text>
          </TouchableOpacity>
          <Text style={{ color: '#fff', fontSize: 22, fontWeight: '800', letterSpacing: -0.5 }}>
            Edit Profile
          </Text>
        </View>

        {/* Avatar */}
        <View style={{ alignItems: 'center', marginBottom: 32 }}>
          <TouchableOpacity onPress={handlePickPhoto} activeOpacity={0.8}>
            <View style={{ position: 'relative' }}>
              {avatarUrl ? (
                <Image
          source={{ uri: `${avatarUrl}?t=${Date.now()}` }}
          style={{ width: 90, height: 90, borderRadius: 45, borderWidth: 2, borderColor: 'rgba(108,92,231,0.5)' }}
        />
              ) : (
                <LinearGradient
                  colors={['#6C5CE7', '#00D1FF']}
                  style={{ width: 90, height: 90, borderRadius: 45, alignItems: 'center', justifyContent: 'center' }}
                >
                  <Text style={{ color: '#fff', fontSize: 36, fontWeight: '800' }}>
                    {username_initial}
                  </Text>
                </LinearGradient>
              )}

              {/* Upload overlay */}
              <View style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                width: 28,
                height: 28,
                borderRadius: 14,
                backgroundColor: '#6C5CE7',
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 2,
                borderColor: '#0B0F17',
              }}>
                {isUploadingPhoto ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={{ color: '#fff', fontSize: 12 }}>✎</Text>
                )}
              </View>
            </View>
          </TouchableOpacity>
          <Text style={{ color: '#7B8496', fontSize: 12, marginTop: 10 }}>
            {isUploadingPhoto ? 'Uploading...' : 'Tap to change photo'}
          </Text>
        </View>

        {/* Form */}
        <View style={{ paddingHorizontal: 20, gap: 20 }}>

          {/* Username */}
          <View>
            <Text style={{ color: '#B8C1D1', fontSize: 13, fontWeight: '500', marginBottom: 8 }}>
              Username
            </Text>
            <TextInput
              value={username}
              onChangeText={setUsername}
              style={{
                backgroundColor: '#141826',
                borderRadius: 14,
                paddingHorizontal: 16,
                paddingVertical: 14,
                color: '#fff',
                fontSize: 15,
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.08)',
              }}
              placeholderTextColor="#7B8496"
              placeholder="your_username"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {/* Display name */}
          <View>
            <Text style={{ color: '#B8C1D1', fontSize: 13, fontWeight: '500', marginBottom: 8 }}>
              Display name
            </Text>
            <TextInput
              value={displayName}
              onChangeText={setDisplayName}
              style={{
                backgroundColor: '#141826',
                borderRadius: 14,
                paddingHorizontal: 16,
                paddingVertical: 14,
                color: '#fff',
                fontSize: 15,
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.08)',
              }}
              placeholderTextColor="#7B8496"
              placeholder="Your Name"
            />
          </View>

          {/* Bio */}
          <View>
            <Text style={{ color: '#B8C1D1', fontSize: 13, fontWeight: '500', marginBottom: 8 }}>
              Bio
            </Text>
            <TextInput
              value={bio}
              onChangeText={setBio}
              style={{
                backgroundColor: '#141826',
                borderRadius: 14,
                paddingHorizontal: 16,
                paddingVertical: 14,
                color: '#fff',
                fontSize: 15,
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.08)',
                height: 100,
                textAlignVertical: 'top',
              }}
              placeholderTextColor="#7B8496"
              placeholder="Tell MirAI about yourself..."
              multiline
              maxLength={160}
            />
            <Text style={{ color: '#7B8496', fontSize: 11, marginTop: 4, textAlign: 'right' }}>
              {bio.length}/160
            </Text>
          </View>

          {/* Current mood */}
          <View>
            <Text style={{ color: '#B8C1D1', fontSize: 13, fontWeight: '500', marginBottom: 12 }}>
              Current mood
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {MOODS.map((mood) => {
                const selected = selectedMood === mood.id
                return (
                  <TouchableOpacity
                    key={mood.id}
                    onPress={() => setSelectedMood(selected ? null : mood.id)}
                    activeOpacity={0.8}
                  >
                    <View style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 6,
                      paddingHorizontal: 14,
                      paddingVertical: 8,
                      borderRadius: 100,
                      backgroundColor: selected ? 'rgba(108,92,231,0.15)' : '#141826',
                      borderWidth: 1,
                      borderColor: selected ? mood.color : 'rgba(255,255,255,0.08)',
                    }}>
                      <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: mood.color }} />
                      <Text style={{ color: selected ? '#fff' : '#B8C1D1', fontSize: 13, fontWeight: selected ? '600' : '400' }}>
                        {mood.label}
                      </Text>
                    </View>
                  </TouchableOpacity>
                )
              })}
            </View>
          </View>

          {/* Save button */}
          <TouchableOpacity onPress={handleSave} disabled={isSaving} activeOpacity={0.85} style={{ marginTop: 8 }}>
            <LinearGradient
              colors={['#6C5CE7', '#8B7FF0']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{ borderRadius: 16, paddingVertical: 18, alignItems: 'center' }}
            >
              {isSaving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>Save changes</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

        </View>
      </ScrollView>
    </View>
  )
}