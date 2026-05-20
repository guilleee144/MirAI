// src/components/ui/ConnectionLogos.tsx
// src/components/ui/ConnectionLogos.tsx
import { Image } from 'react-native'

export function AniListLogo({ size = 32 }: { size?: number }) {
  return (
    <Image
      source={{ uri: 'https://anilist.co/img/icons/apple-touch-icon.png' }}
      style={{ width: size, height: size, borderRadius: size * 0.25 }}
    />
  )
}

export function MyAnimeListLogo({ size = 32 }: { size?: number }) {
  return (
    <Image
      source={{ uri: 'https://cdn.myanimelist.net/img/sp/icon/apple-touch-icon-256.png' }}
      style={{ width: size, height: size, borderRadius: size * 0.25 }}
    />
  )
}

export function SteamLogo({ size = 32 }: { size?: number }) {
  return (
    <Image
      source={require('../../../assets/images/steam-logo.jpg')}
      style={{ width: size, height: size, borderRadius: size * 0.25 }}
      resizeMode="contain"
    />
  )
}

export function IGDBLogo({ size = 32 }: { size?: number }) {
  return (
    <Image
      source={{ uri: 'https://www.igdb.com/favicon.ico' }}
      style={{ width: size, height: size, borderRadius: size * 0.25 }}
    />
  )
}