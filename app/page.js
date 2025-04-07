import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";

export const dynamic = 'force-dynamic'; // Disable caching for this page

export default async function Home() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  // Get recent profiles for the homepage
  const { data: recentProfiles } = await supabase
    .from("profiles_with_auth")
    .select()
    .order('created_at', { ascending: false })
    .limit(3);
    
  return (
    <div className="flex flex-col items-center min-h-screen p-8 gap-8">
      <section className="w-full max-w-6xl mx-auto text-center space-y-6 mt-10">
        <h1 className="text-4xl md:text-5xl font-bold">Welcome to Profile Hub</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Connect, share, and discover user profiles from around the world
        </p>
        <div className="flex flex-wrap gap-4 justify-center mt-6">
          <Link href="/profiles" className="px-6 py-3 bg-gray-800 text-white rounded-full hover:bg-gray-700 transition-colors">
            Browse All Profiles
          </Link>
          {!session ? (
            <Link href="/auth" className="px-6 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-500 transition-colors">
              Sign In
            </Link>
          ) : (
            <Link href="/profile" className="px-6 py-3 bg-green-600 text-white rounded-full hover:bg-green-500 transition-colors">
              My Profile
            </Link>
          )}
        </div>
      </section>

      <section className="w-full max-w-6xl mx-auto mt-16">
        <h2 className="text-2xl font-bold mb-6">Recent Profiles</h2>
        {recentProfiles && recentProfiles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentProfiles.map((profile) => (
              <div key={profile.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
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
                  <h3 className="font-bold text-xl mb-2">{profile.name || 'Anonymous User'}</h3>
                  {profile.email && <p className="text-gray-700">{profile.email}</p>}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-gray-100 p-6 rounded-lg text-center">
            <p>No profiles found yet. Be the first to create one!</p>
            <Link href="/auth" className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500">
              Sign in to create your profile
            </Link>
          </div>
        )}
      </section>

      <section className="w-full max-w-6xl mx-auto mt-16 bg-gray-100 p-8 rounded-lg">
        <h2 className="text-2xl font-bold mb-6">Why Join Our Community?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex flex-col items-center p-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Connect</h3>
            <p className="text-center text-gray-600">Connect with other members and share your experiences</p>
          </div>
          <div className="flex flex-col items-center p-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Verified</h3>
            <p className="text-center text-gray-600">All profiles are verified through secure authentication</p>
          </div>
          <div className="flex flex-col items-center p-4">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Secure</h3>
            <p className="text-center text-gray-600">Your data is protected with industry-standard security</p>
          </div>
        </div>
      </section>
    </div>
  );
}
