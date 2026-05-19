// src/types/user.ts

export type UserRole = 'user' | 'admin'

export type Mood =
  | 'energetic'
  | 'calm'
  | 'excited'
  | 'melancholic'
  | 'happy'
  | 'intense'

export interface UserProfile {
  id: string
  username: string
  display_name: string
  avatar_url: string | null
  bio: string | null
  level: number
  xp: number
  current_mood: Mood | null
  created_at: string
  updated_at: string
}

export interface UserTaste {
  user_id: string
  genres: Record<string, number>        // genre -> affinity score 0-100
  themes: Record<string, number>        // theme -> affinity score
  moods: Record<Mood, number>           // mood -> affinity score
  pacing: 'slow' | 'medium' | 'fast' | null
  updated_at: string
}

export interface UserStats {
  anime_watched: number
  manga_read: number
  games_played: number
  total_watch_time_minutes: number
  average_rating: number
}

// src/types/ai.ts
export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  recommendation?: ContentRecommendation
}

export interface ContentRecommendation {
  id: string
  type: 'anime' | 'manga' | 'game'
  title: string
  cover_image: string
  score: number
  genres: string[]
  reason: string          // AI-generated explanation
}

export interface Memory {
  id: string
  user_id: string
  content: string
  embedding: number[]
  type: 'preference' | 'conversation' | 'behavior'
  created_at: string
}
