// app/(auth)/login.tsx
import { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Image } from 'expo-image'
import { Link } from 'expo-router'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { supabase } from '@/services/supabase'

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
})

type LoginForm = z.infer<typeof loginSchema>

export default function LoginScreen() {
  const [isLoading, setIsLoading] = useState(false)

  const { control, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true)
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    })
    setIsLoading(false)

    if (error) {
      Alert.alert('Error', error.message)
    }
    // AuthProvider handles redirect automatically on session change
  }

  return (
    <View className="flex-1 bg-[#0B0F17]">
      {/* Background gradient */}
      <LinearGradient
        colors={['rgba(108,92,231,0.15)', 'transparent']}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 400 }}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 justify-center px-6"
      >
        {/* Logo */}
        <View className="items-center mb-12">
          <Image
            source={require('../../assets/images/logo.png')}
            style={{ width: 100, height: 100, borderRadius: 24 }}
            contentFit="contain"
          />
          <Text className="text-white text-3xl font-bold mt-4 tracking-wider">
            MirAI
          </Text>
          <Text className="text-[#7B8496] text-sm mt-1 tracking-widest uppercase">
            Anime · Gaming · AI Companion
          </Text>
        </View>

        {/* Form */}
        <View className="gap-4">
          {/* Email */}
          <View>
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  className="bg-[#141826] text-white px-4 py-4 rounded-xl border border-white/10 text-base"
                  placeholder="Email"
                  placeholderTextColor="#7B8496"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  onChangeText={onChange}
                  value={value}
                />
              )}
            />
            {errors.email && (
              <Text className="text-red-400 text-xs mt-1 ml-1">
                {errors.email.message}
              </Text>
            )}
          </View>

          {/* Password */}
          <View>
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  className="bg-[#141826] text-white px-4 py-4 rounded-xl border border-white/10 text-base"
                  placeholder="Contraseña"
                  placeholderTextColor="#7B8496"
                  secureTextEntry
                  onChangeText={onChange}
                  value={value}
                />
              )}
            />
            {errors.password && (
              <Text className="text-red-400 text-xs mt-1 ml-1">
                {errors.password.message}
              </Text>
            )}
          </View>

          {/* Login button */}
          <TouchableOpacity
            onPress={handleSubmit(onSubmit)}
            disabled={isLoading}
            className="mt-2"
          >
            <LinearGradient
              colors={['#6C5CE7', '#8B7FF0']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{ borderRadius: 12, padding: 16, alignItems: 'center' }}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white font-semibold text-base">
                  Entrar
                </Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {/* Register link */}
          <View className="flex-row justify-center mt-4">
            <Text className="text-[#7B8496]">¿No tienes cuenta? </Text>
            <Link href="/(auth)/register">
              <Text className="text-[#6C5CE7] font-medium">Regístrate</Text>
            </Link>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  )
}