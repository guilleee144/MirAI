// src/hooks/useDeviceRegion.ts
// Country of the phone's region (e.g. "ES", "IE"), used to show prices in the right currency.
// The app itself stays in English; only the region is detected.
import { NativeModules } from 'react-native'

function readLocaleTag(): string {
  try {
    const tag = Intl.DateTimeFormat().resolvedOptions().locale
    if (tag) return tag
  } catch {
    // Intl unavailable: fall through to the native module.
  }
  const native = NativeModules.I18nManager?.localeIdentifier
  return typeof native === 'string' ? native : 'en-US'
}

function detectRegion(): string | null {
  const region = readLocaleTag()
    .split(/[-_]/)
    .slice(1)
    .find((part) => /^[A-Za-z]{2}$/.test(part))
  return region ? region.toUpperCase() : null
}

// The phone's region does not change while the app runs.
const deviceRegion = detectRegion()

export function useDeviceRegion(): string | null {
  return deviceRegion
}
