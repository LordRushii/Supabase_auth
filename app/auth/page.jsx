import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { headers } from 'next/headers'

// Function to get the base URL dynamically
function getBaseUrl() {
  const headersList = headers()
  const host = headersList.get('host') || 'localhost:3000'
  
  // Explicitly handle Vercel production domain
  if (host.includes('lithematic.vercel.app')) {
    return 'https://lithematic.vercel.app'
  }
  
  // For localhost or other environments
  const protocol = host.includes('localhost') ? 'http' : 'https'
  return `${protocol}://${host}`
}

async function signInWithGithub() {
  'use server'
  const supabase = await createClient()
  const baseUrl = getBaseUrl()
  const redirectUrl = `${baseUrl}/auth/callback`
  
  console.log('GitHub OAuth Redirect URL:', redirectUrl)
  
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'github',
    options: {
      redirectTo: redirectUrl,
      scopes: 'read:user user:email', // Request access to user profile and email
    },
  })
  
  if (error) {
    console.error('OAuth error:', error)
    return { error: error.message }
  }
  
  return redirect(data?.url || '/')
}

async function signInWithGoogle() {
  'use server'
  const supabase = await createClient()
  const baseUrl = getBaseUrl()
  const redirectUrl = `${baseUrl}/auth/callback`
  
  console.log('Google OAuth Redirect URL:', redirectUrl)
  
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: redirectUrl,
      scopes: 'email profile',
    },
  })
  
  if (error) {
    console.error('OAuth error:', error)
    return { error: error.message }
  }
  
  return redirect(data?.url || '/')
}

async function signOut() {
  'use server'
  const supabase = await createClient()
  await supabase.auth.signOut()
  return redirect('/auth')
}

async function syncProfile() {
  'use server'
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    return { error: 'Not authenticated' }
  }
  
  const { user } = session
  const provider = user.app_metadata?.provider || user.raw_app_meta_data?.provider || 'unknown'
  
  // Create profile data based on provider
  let profileData = {
    id: user.id,
    updated_at: new Date().toISOString(),
  }
  
  // Handle provider-specific metadata fields
  if (provider === 'github') {
    profileData = {
      ...profileData,
      name: user.user_metadata?.name || 'GitHub User',
      email: user.user_metadata?.email || user.email,
      avatar_url: user.user_metadata?.avatar_url,
    }
  } else if (provider === 'google') {
    profileData = {
      ...profileData,
      name: user.user_metadata?.full_name || user.user_metadata?.name || 'Google User',
      email: user.user_metadata?.email || user.email,
      avatar_url: user.user_metadata?.picture || user.user_metadata?.avatar_url,
    }
  } else {
    // Generic fallback for other providers
    profileData = {
      ...profileData,
      name: user.user_metadata?.name || user.user_metadata?.full_name || `${provider} User`,
      email: user.user_metadata?.email || user.email,
      avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture,
    }
  }
  
  // Upsert profile data
  const { error } = await supabase.from('profiles').upsert(profileData)
  
  if (error) {
    console.error('Profile sync error:', error)
    return { error: error.message }
  }
  
  return { success: true, provider }
}

export default async function AuthPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <h1 className="text-2xl font-bold mb-4">Authentication</h1>
      
      {session ? (
        <div className="flex flex-col items-center">
          <div className="mb-4 flex flex-col items-center">
            {session.user.user_metadata?.avatar_url && (
              <img 
                src={session.user.user_metadata.avatar_url || session.user.user_metadata.picture} 
                alt="Profile" 
                className="w-20 h-20 rounded-full mb-2"
              />
            )}
            <p className="text-lg font-medium">
              {session.user.user_metadata?.name || 
               session.user.user_metadata?.full_name || 
               session.user.email}
            </p>
            <p className="text-gray-600">{session.user.email}</p>
            <p className="text-xs text-gray-500 mt-1">User ID: {session.user.id}</p>
            <p className="text-xs text-gray-500">Provider: {session.user.app_metadata?.provider || session.user.raw_app_meta_data?.provider || 'Unknown'}</p>
          </div>
          
          <div className="flex flex-col gap-3 items-center">
            <form action={syncProfile}>
              <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                Sync Profile Data
              </button>
            </form>
            
            <div className="flex space-x-4 my-4">
              <Link href="/profile" className="text-blue-600 hover:underline">
                My Profile
              </Link>
              <span className="text-gray-300">|</span>
              <Link href="/profiles" className="text-blue-600 hover:underline">
                All Profiles
              </Link>
            </div>
            
            <form action={signOut}>
              <button className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
                Sign Out
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center">
          <p className="mb-6 text-gray-600">Sign in to view and manage your profile:</p>
          
          <div className="flex flex-col gap-4 w-full max-w-xs">
            <form action={signInWithGithub}>
              <button type="submit" className="w-full bg-gray-800 hover:bg-gray-900 text-white font-bold py-2 px-4 rounded flex items-center justify-center">
                <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
                Sign In with GitHub
              </button>
            </form>
            
            <form action={signInWithGoogle}>
              <button type="submit" className="w-full bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 font-bold py-2 px-4 rounded flex items-center justify-center">
                <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                    <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"/>
                    <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"/>
                    <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"/>
                    <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"/>
                  </g>
                </svg>
                Sign In with Google
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
} 