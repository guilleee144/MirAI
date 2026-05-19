// app/(auth)/register.tsx
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
  ScrollView,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Link, useRouter } from 'expo-router'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { supabase } from '@/services/supabase'

const registerSchema = z.object({
  username: z
    .string()
    .min(3, 'Mínimo 3 caracteres')
    .max(20, 'Máximo 20 caracteres')
    .regex(/^[a-zA-Z0-9_]+$/, 'Solo letras, números y _'),
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Mínimo 8 caracteres'),
})

type RegisterForm = z.infer<typeof registerSchema>

export default function RegisterScreen() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const { control, handleSubmit, formState: { errors } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (data: RegisterForm) => {
    setIsLoading(true)
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: { username: data.username },
      },
    })
    setIsLoading(false)

    if (error) {
      Alert.alert('Error', error.message)
      return
    }

    // Go to onboarding
   router.replace('/(auth)/onboarding/welcome' as any)
  }

  return (
    <View className="flex-1 bg-[#0B0F17]">
      <LinearGradient
        colors={['rgba(108,92,231,0.12)', 'transparent']}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 300 }}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View className="mb-10">
            <Text className="text-white text-3xl font-bold">
              Crea tu cuenta
            </Text>
            <Text className="text-[#7B8496] mt-2">
              Empieza tu viaje con MirAI
            </Text>
          </View>

          {/* Form */}
          <View className="gap-4">
            {/* Username */}
            <View>
              <Text className="text-[#B8C1D1] text-sm mb-2 ml-1">Usuario</Text>
              <Controller
                control={control}
                name="username"
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    className="bg-[#141826] text-white px-4 py-4 rounded-xl border border-white/10 text-base"
                    placeholder="tu_usuario"
                    placeholderTextColor="#7B8496"
                    autoCapitalize="none"
                    autoCorrect={false}
                    onChangeText={onChange}
                    value={value}
                  />
                )}
              />
              {errors.username && (
                <Text className="text-red-400 text-xs mt-1 ml-1">
                  {errors.username.message}
                </Text>
              )}
            </View>

            {/* Email */}
            <View>
              <Text className="text-[#B8C1D1] text-sm mb-2 ml-1">Email</Text>
              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    className="bg-[#141826] text-white px-4 py-4 rounded-xl border border-white/10 text-base"
                    placeholder="tu@email.com"
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
              <Text className="text-[#B8C1D1] text-sm mb-2 ml-1">Contraseña</Text>
              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    className="bg-[#141826] text-white px-4 py-4 rounded-xl border border-white/10 text-base"
                    placeholder="Mínimo 8 caracteres"
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

            {/* Register button */}
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
                    Crear cuenta
                  </Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Login link */}
            <View className="flex-row justify-center mt-4">
              <Text className="text-[#7B8496]">¿Ya tienes cuenta? </Text>
              <Link href="/(auth)/login">
                <Text className="text-[#6C5CE7] font-medium">Inicia sesión</Text>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  )
}