// src/features/chat/types.ts
export type ChatRole = 'user' | 'assistant'

/** UI-facing message. Decoupled from the DB row so the schema can evolve. */
export interface ChatMessage {
  id: string
  role: ChatRole
  content: string
  createdAt: string
}

/** Raw rows returned by the `chat` Edge Function. */
export interface ChatMessageRow {
  id: string
  role: string
  content: string
  created_at: string | null
}

export interface ChatFunctionResponse {
  user_message: ChatMessageRow
  assistant_message: ChatMessageRow
}
