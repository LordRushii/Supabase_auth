'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';

export default function AuthDebug() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [checkedStoredSession, setCheckedStoredSession] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    
    async function checkSession() {
      try {
        setLoading(true);
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          setError(error.message);
        } else if (session) {
          setUser(session.user);
        }
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    
    checkSession();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth event:', event);
        setUser(session?.user || null);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  // Check localStorage for session data (client-side debug only)
  useEffect(() => {
    if (typeof window !== 'undefined' && !checkedStoredSession) {
      try {
        const lsData = window.localStorage.getItem('supabase.auth.token');
        console.log('localStorage session data exists:', !!lsData);
        if (lsData) {
          try {
            const parsedData = JSON.parse(lsData);
            console.log('Session data timestamp:', new Date(parsedData.expires_at * 1000).toISOString());
            console.log('Session expired:', parsedData.expires_at * 1000 < Date.now());
          } catch (e) {
            console.log('Failed to parse localStorage data');
          }
        }
      } catch (e) {
        console.log('Error accessing localStorage');
      }
      setCheckedStoredSession(true);
    }
  }, [checkedStoredSession]);

  if (loading) {
    return <div className="p-4 bg-blue-50 rounded-md">Loading authentication state...</div>;
  }

  if (error) {
    return <div className="p-4 bg-red-50 rounded-md">Error: {error}</div>;
  }

  return (
    <div className="p-4 bg-gray-50 rounded-md border border-gray-200">
      <h3 className="font-bold mb-2">Client-Side Auth Status</h3>
      {user ? (
        <div>
          <p className="text-green-600 font-medium">✓ Authenticated</p>
          <div className="mt-2 text-sm">
            <p>User ID: <span className="font-mono">{user.id}</span></p>
            <p>Email: {user.email}</p>
            {user.user_metadata && (
              <details className="mt-2">
                <summary className="cursor-pointer">User Metadata</summary>
                <pre className="bg-gray-100 p-2 mt-2 rounded text-xs overflow-auto">
                  {JSON.stringify(user.user_metadata, null, 2)}
                </pre>
              </details>
            )}
          </div>
        </div>
      ) : (
        <p className="text-red-600">✗ Not authenticated</p>
      )}
    </div>
  );
} 