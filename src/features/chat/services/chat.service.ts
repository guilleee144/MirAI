// src/features/chat/services/chat.service.ts
import { FunctionsHttpError } from '@supabase/supabase-js'
import { supabase } from '@/services/supabase'
import type { ChatFunctionResponse, ChatMessage, ChatMessageRow } from '../types'

export const HISTORY_PAGE_SIZE = 50

function toChatMessage(row: ChatMessageRow): ChatMessage | null {
  if (row.role !== 'user' && row.role !== 'assistant') return null
  return {
    id: row.id,
    role: row.role,
    content: row.content,
    createdAt: row.created_at ?? new Date().toISOString(),
  }
}

/** Newest first — matches an inverted FlatList, no reversing needed in the UI. */
export async function fetchChatHistory(userId: string, limit = HISTORY_PAGE_SIZE): Promise<ChatMessage[]> {
  const { data, error } = await supabase
    .from('chat_messages')
    .select('id, role, content, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw new Error(error.message)

  return (data ?? []).flatMap((row) => {
    const message = toChatMessage(row)
    return message ? [message] : []
  })
}

async function extractErrorMessage(error: unknown): Promise<string> {
  if (error instanceof FunctionsHttpError) {
    try {
      const payload = (await error.context.json()) as { error?: string }
      if (payload?.error) return payload.error
    } catch {
      // fall through to the generic message
    }
  }
  return 'Something went wrong talking to MirAI. Please try again.'
}

export async function sendChatMessage(
  message: string
): Promise<{ userMessage: ChatMessage; assistantMessage: ChatMessage }> {
  const { data, error } = await supabase.functions.invoke<ChatFunctionResponse>('chat', {
    body: { message },
  })

  if (error) throw new Error(await extractErrorMessage(error))

  const userMessage = data ? toChatMessage(data.user_message) : null
  const assistantMessage = data ? toChatMessage(data.assistant_message) : null
  if (!userMessage || !assistantMessage) {
    throw new Error('MirAI sent an unexpected response. Please try again.')
  }

  return { userMessage, assistantMessage }
}
