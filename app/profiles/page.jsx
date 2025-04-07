import { createClient } from '@/utils/supabase/server'
import AuthDebug from '@/components/AuthDebug'
import Link from 'next/link'

export const dynamic = 'force-dynamic' // Disable caching for this page

export default async function Profiles() {
  const supabase = await createClient()
  
  // Check current session
  const { data: { session }, error: sessionError } = await supabase.auth.getSession()
  
  // Fetch profiles with error handling
  const { data: profiles, error: profilesError } = await supabase
    .from("profiles_with_auth")
    .select()

  
  // Get provider icon
  const getProviderIcon = (provider) => {
    switch(provider?.toLowerCase()) {
      case 'github':
        return (
          <svg className="h-4 w-4 text-gray-800" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
          </svg>
        );
      case 'google':
        return (
          <svg className="h-4 w-4" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
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
      <h1 className="text-2xl font-bold mb-6">User Profiles</h1>
      
      {/* Navigation between all profiles and my profile */}
      <div className="mb-6 flex space-x-4">
        <Link href="/profiles" className="font-medium px-3 py-1 bg-gray-800 text-white rounded">
          All Profiles
        </Link>
        <Link href="/profile" className="font-medium px-3 py-1 bg-gray-200 text-gray-800 rounded hover:bg-gray-300">
          My Profile
        </Link>
      </div>
      
      
      
     
      
      {profiles && profiles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {profiles.map((profile) => {
            const isCurrentUser = session?.user?.id === profile.id;
            
            return (
              <div key={profile.id} className={`bg-white rounded-lg shadow-md overflow-hidden ${isCurrentUser ? 'ring-2 ring-blue-500' : ''}`}>
                {isCurrentUser && (
                  <div className="bg-blue-500 text-white text-xs font-medium py-1 text-center">
                    YOUR PROFILE
                  </div>
                )}
                {profile.avatar_url ? (
                  <img 
                    src={profile.avatar_url} 
                    alt={profile.name || 'User profile'} 
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-500">No avatar</span>
                  </div>
                )}
                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <h2 className="font-bold text-xl mb-2">{profile.name || 'Anonymous User'}</h2>
                    <div className="flex items-center text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      {getProviderIcon(profile.provider)}
                      <span className="ml-1 capitalize text-xs">{profile.provider || 'unknown'}</span>
                    </div>
                  </div>
                  {isCurrentUser && profile.email && <p className="text-gray-700">{profile.email}</p>}
                  <p className="text-xs text-gray-500 mt-2">
                    ID: {profile.id.substring(0, 8)}...
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-gray-100 p-6 rounded-lg">
          <p className="mb-2">No profiles found. Users who sign in with GitHub or Google will appear here.</p>
          {!session ? (
            <p className="text-sm text-gray-600">Please sign in with GitHub or Google first.</p>
          ) : (
            <p className="text-sm text-gray-600">You're signed in, but no profiles exist in the database yet.</p>
          )}
        </div>
      )}
    </div>
  )
} 