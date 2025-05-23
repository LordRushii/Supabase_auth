import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        async get(name) {
          const cookie = await cookieStore.get(name)
          return cookie?.value
        },
        async set(name, value, options) {
          await cookieStore.set({ name, value, ...options })
        },
        async remove(name, options) {
          await cookieStore.set({ name, value: '', ...options })
        },
      },
    }
  )
} 