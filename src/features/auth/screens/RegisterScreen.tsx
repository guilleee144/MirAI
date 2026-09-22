// src/features/auth/screens/RegisterScreen.tsx
// Migrated from app/(auth)/register.tsx (same swap list as LoginScreen).
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
import LinearGradient from 'react-native-linear-gradient'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { supabase } from '@/services/supabase'
import { colors } from '@/theme/colors'
import type { AuthStackParamList } from '@/app/navigation/types'

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
type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>

export function RegisterScreen({ navigation }: Props) {
  const [isLoading, setIsLoading] = useState(false)

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({ resolver: zodResolver(registerSchema) })

  const onSubmit = async (data: RegisterForm) => {
    setIsLoading(true)

    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: { data: { username: data.username } },
    })

    if (error) {
      setIsLoading(false)
      Alert.alert('Error', error.message)
      return
    }

    if (authData.user) {
      const { error: profileError } = await supabase.from('profiles').insert({
        id: authData.user.id,
        username: data.username,
        display_name: data.username,
      })

      if (profileError) {
        console.log('Profile error:', profileError.message)
        // No bloqueamos — el usuario se creó igualmente
      }
    }

    setIsLoading(false)
    // Session is now set — RootNavigator will swap to AppStack, which
    // lands on the tabs. Onboarding (taste/connect) is offered from
    // there for now; see roadmap note in AuthNavigator if we want to
    // force it as a gate before the tabs instead.
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background.primary }}>
      <LinearGradient
        colors={['rgba(108,92,231,0.12)', 'transparent']}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 300 }}
      />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={{ marginBottom: 40 }}>
            <Text style={{ color: colors.text.primary, fontSize: 30, fontWeight: '800' }}>Crea tu cuenta</Text>
            <Text style={{ color: colors.text.tertiary, marginTop: 8 }}>Empieza tu viaje con MirAI</Text>
          </View>

          <View style={{ gap: 16 }}>
            <View>
              <Text style={styles.label}>Usuario</Text>
              <Controller
                control={control}
                name="username"
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    style={styles.input}
                    placeholder="tu_usuario"
                    placeholderTextColor={colors.text.tertiary}
                    autoCapitalize="none"
                    autoCorrect={false}
                    onChangeText={onChange}
                    value={value}
                  />
                )}
              />
              {errors.username && <Text style={styles.error}>{errors.username.message}</Text>}
            </View>

            <View>
              <Text style={styles.label}>Email</Text>
              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    style={styles.input}
                    placeholder="tu@email.com"
                    placeholderTextColor={colors.text.tertiary}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    onChangeText={onChange}
                    value={value}
                  />
                )}
              />
              {errors.email && <Text style={styles.error}>{errors.email.message}</Text>}
            </View>

            <View>
              <Text style={styles.label}>Contraseña</Text>
              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    style={styles.input}
                    placeholder="Mínimo 8 caracteres"
                    placeholderTextColor={colors.text.tertiary}
                    secureTextEntry
                    onChangeText={onChange}
                    value={value}
                  />
                )}
              />
              {errors.password && <Text style={styles.error}>{errors.password.message}</Text>}
            </View>

            <TouchableOpacity onPress={handleSubmit(onSubmit)} disabled={isLoading} style={{ marginTop: 8 }}>
              <LinearGradient
                colors={['#6C5CE7', '#8B7FF0']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{ borderRadius: 12, padding: 16, alignItems: 'center' }}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={{ color: '#fff', fontWeight: '600', fontSize: 16 }}>Crear cuenta</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 16 }}>
              <Text style={{ color: colors.text.tertiary }}>¿Ya tienes cuenta? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={{ color: colors.primary.DEFAULT, fontWeight: '500' }}>Inicia sesión</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  )
}

const styles = {
  label: {
    color: colors.text.secondary,
    fontSize: 14,
    marginBottom: 8,
    marginLeft: 4,
  },
  input: {
    backgroundColor: colors.background.surface,
    color: colors.text.primary,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border.DEFAULT,
    fontSize: 16,
  },
  error: {
    color: colors.error,
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
} as const
