// src/features/profile/profileData.ts
import { supabase } from '@/services/supabase'
import type { ProfileItem } from './profileStats'

const PAGE_SIZE = 1000 // Supabase returns at most 1000 rows per request

/** Every tracked title of the user (only the columns the profile needs). */
export async function fetchProfileItems(userId: string): Promise<ProfileItem[]> {
  const items: ProfileItem[] = []

  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await supabase
      .from('tracking')
      .select('content_type, status, progress, rating, metadata')
      .eq('user_id', userId)
      .range(from, from + PAGE_SIZE - 1)

    if (error || !data) break
    items.push(...data)
    if (data.length < PAGE_SIZE) break
  }

  return items
}
