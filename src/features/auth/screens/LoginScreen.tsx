// src/features/auth/screens/LoginScreen.tsx
// Migrated from app/(auth)/login.tsx.
//   expo-linear-gradient  -> react-native-linear-gradient (default export!)
//   expo-image            -> react-native Image
//   expo-router Link      -> navigation.navigate()
//   NativeWind className  -> style objects (see decision: NativeWind dropped)
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
  Image,
} from 'react-native'
import LinearGradient from 'react-native-linear-gradient'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { supabase } from '@/services/supabase'
import { colors } from '@/theme/colors'
import type { AuthStackParamList } from '@/app/navigation/types'

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
})

type LoginForm = z.infer<typeof loginSchema>
type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>

export function LoginScreen({ navigation }: Props) {
  const [isLoading, setIsLoading] = useState(false)

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) })

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
    // No manual redirect — RootNavigator swaps to AppStack when the
    // Supabase session changes (see AuthProvider + RootNavigator).
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background.primary }}>
      <LinearGradient
        colors={['rgba(108,92,231,0.15)', 'transparent']}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 400 }}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1, justifyContent: 'center', paddingHorizontal: 24 }}
      >
        <View style={{ alignItems: 'center', marginBottom: 48 }}>
          <Image
            source={require('../../../../assets/images/logo.png')}
            style={{ width: 100, height: 100, borderRadius: 24 }}
            resizeMode="contain"
          />
          <Text style={{ color: colors.text.primary, fontSize: 30, fontWeight: '800', marginTop: 16, letterSpacing: 2 }}>
            MirAI
          </Text>
          <Text
            style={{
              color: colors.text.tertiary,
              fontSize: 13,
              marginTop: 4,
              letterSpacing: 3,
              textTransform: 'uppercase',
            }}
          >
            Anime · Gaming · AI Companion
          </Text>
        </View>

        <View style={{ gap: 16 }}>
          <View>
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={styles.input}
                  placeholder="Email"
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
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={styles.input}
                  placeholder="Contraseña"
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
                <Text style={{ color: '#fff', fontWeight: '600', fontSize: 16 }}>Entrar</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 16 }}>
            <Text style={{ color: colors.text.tertiary }}>¿No tienes cuenta? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={{ color: colors.primary.DEFAULT, fontWeight: '500' }}>Regístrate</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  )
}

const styles = {
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
