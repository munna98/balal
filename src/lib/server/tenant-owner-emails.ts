import { createServiceRoleClient } from '@/lib/supabase/service-role'

/** Resolve auth user emails for tenant owner IDs (Supabase `auth.users.id`). Server-only. */
export async function getOwnerEmailsBySupabaseIds(ids: string[]): Promise<Map<string, string>> {
  const map = new Map<string, string>()
  const unique = [...new Set(ids.filter(Boolean))]
  if (unique.length === 0) return map

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY || !process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return map
  }

  let supabase: ReturnType<typeof createServiceRoleClient>
  try {
    supabase = createServiceRoleClient()
  } catch {
    return map
  }

  await Promise.all(
    unique.map(async (id) => {
      const { data, error } = await supabase.auth.admin.getUserById(id)
      if (!error && data.user?.email) {
        map.set(id, data.user.email)
      }
    })
  )

  return map
}
