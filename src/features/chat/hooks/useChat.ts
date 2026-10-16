// src/features/chat/hooks/useChat.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/providers/AuthProvider'
import { fetchChatHistory, sendChatMessage } from '../services/chat.service'
import type { ChatMessage } from '../types'

const OPTIMISTIC_PREFIX = 'local-'

export const chatKeys = {
  messages: (userId: string) => ['chat', 'messages', userId] as const,
}

export function useChat() {
  const { user } = useAuth()
  const userId = user?.id ?? ''
  const queryClient = useQueryClient()
  const queryKey = chatKeys.messages(userId)

  const history = useQuery({
    queryKey,
    queryFn: () => fetchChatHistory(userId),
    enabled: !!userId,
    staleTime: 60_000,
  })

  const sendMutation = useMutation({
    mutationFn: sendChatMessage,

    // Show the user's message instantly; the server confirms it afterwards.
    onMutate: async (text: string) => {
      await queryClient.cancelQueries({ queryKey })
      const previous = queryClient.getQueryData<ChatMessage[]>(queryKey)
      const optimistic: ChatMessage = {
        id: `${OPTIMISTIC_PREFIX}${Date.now()}`,
        role: 'user',
        content: text,
        createdAt: new Date().toISOString(),
      }
      queryClient.setQueryData<ChatMessage[]>(queryKey, (old = []) => [optimistic, ...old])
      return { previous }
    },

    onError: (_error, _text, context) => {
      queryClient.setQueryData<ChatMessage[]>(queryKey, context?.previous ?? [])
    },

    // Swap the optimistic row for the persisted pair — no refetch needed.
    onSuccess: ({ userMessage, assistantMessage }) => {
      queryClient.setQueryData<ChatMessage[]>(queryKey, (old = []) => [
        assistantMessage,
        userMessage,
        ...old.filter((m) => !m.id.startsWith(OPTIMISTIC_PREFIX)),
      ])
    },
  })

  return {
    messages: history.data ?? [],
    isLoading: history.isLoading,
    isError: history.isError,
    refetch: history.refetch,
    isSending: sendMutation.isPending,
    send: sendMutation.mutate,
  }
}
