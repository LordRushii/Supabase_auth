import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic' // Disable caching for this page

export default async function MyProfile() {
  const supabase = await createClient()
  
  // Check current session
  const { data: { session } } = await supabase.auth.getSession()
  
  // If not authenticated, redirect to login
  if (!session) {
    return redirect('/auth')
  }
  
  const provider = session.user.app_metadata?.provider || session.user.raw_app_meta_data?.provider || 'Unknown'
  
  // Fetch only the current user's profile
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select()
    .eq('id', session.user.id)
    .single()

  // Get provider icon
  const getProviderIcon = (provider) => {
    switch(provider.toLowerCase()) {
      case 'github':
        return (
          <svg className="h-5 w-5 text-gray-800" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
          </svg>
        );
      case 'google':
        return (
          <svg className="h-5 w-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
              <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"/>
              <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"/>
              <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"/>
              <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"/>
            </g>
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">My Profile</h1>
      
      {/* Navigation between all profiles and my profile */}
      <div className="mb-6 flex space-x-4">
        <Link href="/profiles" className="font-medium px-3 py-1 bg-gray-200 text-gray-800 rounded hover:bg-gray-300">
          All Profiles
        </Link>
        <Link href="/profile" className="font-medium px-3 py-1 bg-gray-800 text-white rounded">
          My Profile
        </Link>
      </div>
      
      {profileError && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg">
          <p className="font-semibold">Error loading your profile:</p>
          <p>{profileError.message}</p>
        </div>
      )}
      
      {profile ? (
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-blue-500 text-white py-2 px-4 text-center">
              <h2 className="text-lg font-bold">YOUR PROFILE</h2>
            </div>
            
            <div className="p-6">
              <div className="flex flex-col md:flex-row items-center gap-8">
                {profile.avatar_url ? (
                  <img 
                    src={profile.avatar_url} 
                    alt={profile.name || 'Your profile'} 
                    className="w-40 h-40 rounded-full object-cover border-4 border-gray-200"
                  />
                ) : (
                  <div className="w-40 h-40 rounded-full bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-500">No avatar</span>
                  </div>
                )}
                
                <div className="flex-1">
                  <h2 className="text-2xl font-bold mb-2">{profile.name || 'Anonymous User'}</h2>
                  {profile.email && <p className="text-gray-700 mb-1">{profile.email}</p>}
                  
                  <div className="flex items-center mt-2 text-sm text-gray-600">
                    <span className="mr-2">Signed in with:</span>
                    <span className="flex items-center font-medium">
                      {getProviderIcon(provider)}
                      <span className="ml-1 capitalize">{provider}</span>
                    </span>
                  </div>
                  
                  <p className="text-xs text-gray-500 mt-2 mb-4">ID: {profile.id}</p>
                  
                  <div className="border-t pt-4 mt-4">
                    <Link href="/auth" className="text-blue-600 hover:underline">
                      Manage Authentication
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-lg">
          <p className="text-yellow-800 font-medium">Your profile was not found.</p>
          <p className="mt-2">This is unusual since you're authenticated. Try clicking the "Sync Profile Data" button on the Auth page.</p>
          <div className="mt-4">
            <Link href="/auth" className="text-blue-600 hover:underline">
              Go to Auth Page
            </Link>
          </div>
        </div>
      )}
    </div>
  )
} 