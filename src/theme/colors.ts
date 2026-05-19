// src/theme/colors.ts
// MirAI Design System — Color Tokens

export const colors = {
  // ─── Backgrounds ──────────────────────────────────────────
  background: {
    primary: '#0B0F17',    // Deepest — page bg
    surface: '#141826',    // Cards, sheets
    elevated: '#1B2133',   // Modals, floating UI
    overlay: 'rgba(11,15,23,0.8)',
  },

  // ─── Brand ────────────────────────────────────────────────
  primary: {
    DEFAULT: '#6C5CE7',
    light: '#8B7FF0',
    dark: '#4E42C4',
    muted: 'rgba(108,92,231,0.15)',
    border: 'rgba(108,92,231,0.3)',
  },

  secondary: {
    DEFAULT: '#00D1FF',
    light: '#33DAFF',
    dark: '#00A8CC',
    muted: 'rgba(0,209,255,0.12)',
    border: 'rgba(0,209,255,0.25)',
  },

  accent: {
    DEFAULT: '#2EE59D',
    light: '#5EEDB3',
    dark: '#1EC27E',
    muted: 'rgba(46,229,157,0.12)',
    border: 'rgba(46,229,157,0.25)',
  },

  // ─── Semantic ─────────────────────────────────────────────
  success: '#2EE59D',
  warning: '#FFB347',
  error: '#FF6B6B',
  info: '#00D1FF',

  // ─── Text ─────────────────────────────────────────────────
  text: {
    primary: '#FFFFFF',
    secondary: '#B8C1D1',
    tertiary: '#7B8496',
    disabled: '#4A5260',
    inverse: '#0B0F17',
  },

  // ─── Border ───────────────────────────────────────────────
  border: {
    subtle: 'rgba(255,255,255,0.06)',
    DEFAULT: 'rgba(255,255,255,0.1)',
    strong: 'rgba(255,255,255,0.18)',
  },

  // ─── Glassmorphism ────────────────────────────────────────
  glass: {
    background: 'rgba(20,24,38,0.7)',
    border: 'rgba(255,255,255,0.08)',
  },

  // ─── Mood palette ─────────────────────────────────────────
  mood: {
    energetic: '#FFB347',
    calm: '#00D1FF',
    excited: '#6C5CE7',
    melancholic: '#7B8496',
    happy: '#2EE59D',
    intense: '#FF6B6B',
  },
} as const

export type ColorToken = typeof colors
