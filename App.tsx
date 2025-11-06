import React, { useState, useEffect } from 'react';
import { Dashboard } from './pages/Dashboard';
import { AuthPage } from './pages/AuthPage';
import { User } from './types';
import { supabase } from './services/supabase';
import { Session } from '@supabase/supabase-js';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      await handleAuthChange(session);
      setLoading(false);
    };
    
    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        await handleAuthChange(session);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleAuthChange = async (session: Session | null) => {
    if (session?.user) {
      const supabaseUser = session.user;
      try {
        // Fetch user profile from 'profiles' table
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', supabaseUser.id)
          .single();
          
        if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
          throw error;
        }

        if (profile) {
          setUser({
            id: supabaseUser.id,
            email: supabaseUser.email || '',
            name: profile.full_name || 'Usuário',
          });
        } else {
          // Profile doesn't exist, create it. This happens on first sign-up.
          // Supabase stores the name from signup in user_metadata
          const newName = supabaseUser.user_metadata?.name || 'Novo Usuário';
          const { data: newProfile, error: insertError } = await supabase
            .from('profiles')
            .insert({ id: supabaseUser.id, full_name: newName })
            .select()
            .single();

          if (insertError) throw insertError;

          setUser({
            id: supabaseUser.id,
            email: supabaseUser.email || '',
            name: newProfile.full_name || 'Usuário',
          });
        }
      } catch (error) {
        console.error("Error fetching/creating user profile:", error);
        setUser({ // Fallback to auth data if profile fails
          id: supabaseUser.id,
          email: supabaseUser.email || '',
          name: supabaseUser.user_metadata?.name || 'Usuário',
        });
      }
    } else {
      setUser(null);
    }
  };
  
  const handleUpdateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        // Log the error for debugging, but don't block the user from logging out locally.
        console.error('Error signing out from Supabase:', error.message);
      }
    } catch (e) {
      console.error('An unexpected error occurred during sign out:', e);
    } finally {
      // Always clear the local user state to return to the login page.
      setUser(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-light-bg dark:bg-dark-bg">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="font-sans text-light-text dark:text-dark-text min-h-screen">
      {user ? (
        <Dashboard user={user} onUpdateUser={handleUpdateUser} onLogout={handleLogout} />
      ) : (
        <AuthPage />
      )}
    </div>
  );
};

export default App;