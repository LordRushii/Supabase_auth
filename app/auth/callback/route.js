import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const cookieStore = cookies()
    const supabase = createServerClient(
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
    
    try {
      // Exchange the code for a session
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        console.error("Error exchanging code for session:", error.message)
        return NextResponse.redirect(new URL('/auth?error=session_error', request.url))
      }
      
      if (data?.user) {
        // Get user details from the session metadata
        const { id, user_metadata, app_metadata, raw_app_meta_data } = data.user
        const provider = app_metadata?.provider || raw_app_meta_data?.provider || 'unknown'
        
        console.log("User authenticated with provider:", provider)
        console.log("User ID:", id)
        console.log("User metadata:", user_metadata)
        
        // Extract profile data based on provider
        let profileData = {
          id,
          updated_at: new Date().toISOString(),
        }
        
        // Handle provider-specific metadata fields
        if (provider === 'github') {
          profileData = {
            ...profileData,
            name: user_metadata?.name || 'GitHub User',
            email: user_metadata?.email || data.user.email,
            avatar_url: user_metadata?.avatar_url,
          }
        } else if (provider === 'google') {
          profileData = {
            ...profileData,
            name: user_metadata?.full_name || user_metadata?.name || 'Google User',
            email: user_metadata?.email || data.user.email,
            avatar_url: user_metadata?.picture || user_metadata?.avatar_url,
          }
        } else {
          // Generic fallback for other providers
          profileData = {
            ...profileData,
            name: user_metadata?.name || user_metadata?.full_name || `${provider} User`,
            email: user_metadata?.email || data.user.email,
            avatar_url: user_metadata?.avatar_url || user_metadata?.picture,
          }
        }
        
        // Upsert profile data
        const { error: profileError } = await supabase.from('profiles').upsert(profileData)
        
        if (profileError) {
          console.error("Error upserting profile:", profileError.message)
        } else {
          console.log("Profile upserted successfully for user:", id)
        }
      }
    } catch (err) {
      console.error("Unexpected error in auth callback:", err.message)
      return NextResponse.redirect(new URL('/auth?error=unexpected', request.url))
    }
  }

  // URL to redirect to after sign in process completes
  return NextResponse.redirect(new URL('/profile', request.url))
} 