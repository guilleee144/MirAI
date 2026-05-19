// app/(app)/profile.tsx
import { View, Text, TouchableOpacity } from 'react-native'
import { useAuth } from '@/providers/AuthProvider'

export default function ProfileScreen() {
  const { signOut, user } = useAuth()

  return (
    <View className="flex-1 bg-[#0B0F17] items-center justify-center px-6">
      <Text className="text-white text-2xl font-bold">Profile</Text>
      <Text className="text-[#7B8496] mt-2">{user?.email}</Text>
      <TouchableOpacity
        onPress={signOut}
        className="mt-8 bg-[#141826] px-8 py-4 rounded-xl border border-white/10"
      >
        <Text className="text-[#FF6B6B]">Cerrar sesión</Text>
      </TouchableOpacity>
    </View>
  )
}