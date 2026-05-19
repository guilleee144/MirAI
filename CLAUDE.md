# MirAI — Project Context for AI Assistants

## What is MirAI
MirAI is a production-grade AI-powered anime, manga and gaming companion app for iOS and Android. It is NOT a generic chatbot and NOT only a tracker. It is a persistent AI companion that remembers users, understands their emotional preferences, analyzes behavioral patterns, and recommends content intelligently.

## Current Status
- Phase 1 complete: project setup, architecture, config files, folder structure
- Phase 2 complete: auth flow (login, register), providers, Supabase schema and types
- Phase 3 in progress: onboarding screens, home screen

---

## Tech Stack

### Frontend
- Expo SDK 52 + React Native 0.76
- TypeScript (strict mode)
- NativeWind v4 (Tailwind for React Native)
- Zustand v5 (client state)
- TanStack Query v5 (server state)
- React Hook Form + Zod (forms and validation)
- Expo Router v4 (file-based routing)
- React Native Reanimated v3 (animations)
- Expo Linear Gradient, Expo Blur, Expo Image

### Backend
- Supabase (Auth, PostgreSQL, pgvector, Realtime, Storage, Edge Functions)
- PostgreSQL with pgvector extension for semantic search
- Row Level Security (RLS) on all tables
- Supabase Edge Functions (Deno) for all AI calls

### AI
- OpenAI GPT-4o for companion chat (server-side only via Edge Functions)
- OpenAI text-embedding-3-small for memory embeddings
- pgvector for semantic memory retrieval
- OPENAI_API_KEY is NEVER exposed to the client

### External APIs
- AniList API (anime + manga data)
- Steam API (game library sync)
- IGDB API via Twitch (game metadata)

---

## Color System
```
background primary:  #0B0F17
background surface:  #141826
background elevated: #1B2133
primary:             #6C5CE7
primary light:       #8B7FF0
secondary:           #00D1FF
accent:              #2EE59D
text primary:        #FFFFFF
text secondary:      #B8C1D1
text tertiary:       #7B8496
error:               #FF6B6B
warning:             #FFB347
```

---

## Folder Structure
```
app/
  _layout.tsx                  Root layout (GestureHandlerRootView + QueryProvider + AuthProvider)
  (auth)/
    _layout.tsx                Stack navigator, no header, fade animation
    login.tsx                  Login with react-hook-form + zod + LinearGradient
    register.tsx               Register, navigates to (app) on success
    onboarding/
      welcome.tsx              (pending) First onboarding screen
      taste.tsx                (pending) Genre/taste selection
      connect.tsx              (pending) AniList/Steam connection (skippable)
  (app)/
    _layout.tsx                Tab navigator (Home, Chat, Discover, Profile)
    index.tsx                  Home screen (pending full implementation)
    chat.tsx                   AI Companion chat (pending)
    discover.tsx               Discover/recommendations (pending)
    profile.tsx                Profile with signOut

src/
  providers/
    QueryProvider.tsx          TanStack Query client (staleTime 5min, gcTime 10min)
    AuthProvider.tsx           Supabase session + automatic route protection
  stores/
    auth.store.ts              Zustand: user, profile, isOnboarded
  services/
    supabase.ts                Supabase client with ExpoSecureStore adapter
  types/
    index.ts                   Re-exports (only user.ts for now)
    user.ts                    UserProfile, UserTaste, UserStats, Mood, ChatMessage, ContentRecommendation, Memory
    supabase.ts                Generated Database types from Supabase dashboard
    anime.ts                   (pending)
    manga.ts                   (pending)
    game.ts                    (pending)
    ai.ts                      (pending)
  theme/
    colors.ts                  Full color token system
  features/                    (structure created, implementation pending)
    auth/
    companion/
    discover/
    home/
    profile/
    tracking/
    insights/
    connections/

supabase/
  migrations/                  SQL migrations (pending to add files)

landing.html                   Marketing landing page (standalone HTML, open in browser)
```

---

## Database Schema (Supabase PostgreSQL)

### Extensions
- uuid-ossp
- vector (pgvector)

### Enums
- `mood_type`: energetic, calm, excited, melancholic, happy, intense
- `content_type`: anime, manga, game
- `tracking_status`: watching, completed, dropped, plan_to_watch, on_hold

### Tables
```sql
profiles          id, username, display_name, avatar_url, bio, level, xp, current_mood, is_onboarded
user_taste        id, user_id, genres (jsonb), themes (jsonb), moods (jsonb), pacing
memories          id, user_id, content, embedding (vector 1536), type, metadata
chat_messages     id, user_id, role, content, metadata
tracking          id, user_id, content_type, external_id, title, cover_image, status, rating, progress, metadata
```

### RLS
All tables have Row Level Security enabled. Users can only access their own data via `auth.uid() = user_id`.

### Trigger
`handle_new_user()` — auto-creates a profile row when a new user signs up via Supabase Auth.

### Vector index
`memories_embedding_idx` using ivfflat with vector_cosine_ops (lists=100) for semantic search.

---

## Architecture Rules
1. OPENAI_API_KEY never on the client — only in Supabase Edge Functions
2. Supabase client uses ExpoSecureStore for token storage (not AsyncStorage)
3. Feature-first architecture under src/features/
4. Strict TypeScript: noUncheckedIndexedAccess, exactOptionalPropertyTypes, noImplicitReturns
5. Dark mode first, always
6. NativeWind classes for all styling
7. TanStack Query for all server state, Zustand for client-only state
8. All forms use React Hook Form + Zod schema validation
9. Path aliases: @/ → src/, @features/, @components/, @services/, @stores/, @hooks/, @lib/, @theme/, @constants/, @providers/

---

## Environment Variables
```
EXPO_PUBLIC_SUPABASE_URL         Supabase project URL (client-safe)
EXPO_PUBLIC_SUPABASE_ANON_KEY    Supabase anon public key (client-safe)
OPENAI_API_KEY                   OpenAI key — server-side only, never in client
EXPO_PUBLIC_ANILIST_CLIENT_ID    AniList OAuth client ID
STEAM_API_KEY                    Steam API key — server-side only
IGDB_CLIENT_ID                   Twitch/IGDB client ID — server-side only
IGDB_CLIENT_SECRET               Twitch/IGDB secret — server-side only
```

---

## MVP Build Order
- [x] Phase 1: Setup, architecture, config, folder structure
- [x] Phase 2: Auth flow, Supabase schema, TypeScript types, providers, stores
- [ ] Phase 3: Onboarding screens (welcome, taste, connect)
- [ ] Phase 4: Home screen (mood banner, companion card, top picks)
- [ ] Phase 5: AI Chat screen with memory system
- [ ] Phase 6: Supabase Edge Functions (OpenAI proxy, memory, embeddings)
- [ ] Phase 7: Discover screen (recommendations)
- [ ] Phase 8: Profile screen (stats, taste radar, activity)
- [ ] Phase 9: AniList + Steam sync
- [ ] Phase 10: AI Insights screen
- [ ] Phase 11: Polish, animations, launch

---

## Design Philosophy
- Premium, fluid, futuristic, elegant, minimal
- Subtle glassmorphism on cards
- Smooth gradients using primary/secondary colors
- Rounded cards (border radius 12-24px)
- Clean spacing, modern typography
- Smooth Reanimated animations (fade, slide up, float)
- Never noisy, never cluttered, never aggressive anime UI
- The UI should feel like Spotify meets a premium AI companion