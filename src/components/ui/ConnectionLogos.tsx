// src/components/ui/ConnectionLogos.tsx
import Svg, { Path, Rect, Circle, G, Text as SvgText } from 'react-native-svg'

export function AniListLogo({ size = 32 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 32 32">
      <Rect width="32" height="32" rx="8" fill="#02A9FF" />
      <SvgText
        x="16"
        y="22"
        fontSize="14"
        fontWeight="bold"
        fill="white"
        textAnchor="middle"
      >
        AL
      </SvgText>
    </Svg>
  )
}

export function MyAnimeListLogo({ size = 32 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 32 32">
      <Rect width="32" height="32" rx="8" fill="#2E51A2" />
      <SvgText
        x="16"
        y="22"
        fontSize="10"
        fontWeight="bold"
        fill="white"
        textAnchor="middle"
      >
        MAL
      </SvgText>
    </Svg>
  )
}

export function SteamLogo({ size = 32 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 32 32">
      <Rect width="32" height="32" rx="8" fill="#1B2838" />
      <Circle cx="16" cy="14" r="6" fill="none" stroke="#C6D4DF" strokeWidth="2" />
      <Circle cx="16" cy="14" r="2.5" fill="#C6D4DF" />
      <Path
        d="M10 20 Q13 24 16 24 Q19 24 22 20"
        stroke="#C6D4DF"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />
    </Svg>
  )
}

export function IGDBLogo({ size = 32 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 32 32">
      <Rect width="32" height="32" rx="8" fill="#9147FF" />
      <SvgText
        x="16"
        y="22"
        fontSize="10"
        fontWeight="bold"
        fill="white"
        textAnchor="middle"
      >
        IGDB
      </SvgText>
    </Svg>
  )
}