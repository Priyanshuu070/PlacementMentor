"use client"
import { useState, useEffect, useContext } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/services/supabaseClient";
import { UserDetailContext } from "@/context/UserDetail.context";
import { ResumeAnalysisProvider } from "@/context/ResumeAnalysis.context";

export default function Provider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkUserAndFetch = async () => {
      try {
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

        if (authError || !authUser) {
          setLoading(false);
          return;
        }

        // Fetch or create user in Users table
        // Using maybeSingle() to avoid error when no user exists
        const { data: existingUser, error: fetchError } = await supabase
          .from('Users')
          .select('*')
          .eq('email', authUser.email)
          .maybeSingle();

        if (fetchError) {
          // Log only if it's a real error (not just "no rows")
          if (fetchError.message) {
            console.error('Error fetching user:', fetchError.message);
          }
          setLoading(false);
          return;
        }

        if (existingUser) {
          setUser({
            Name: existingUser.Name,
            email: existingUser.email,
            pfp: existingUser.pfp,
            credits: existingUser.credits,
            created_at: existingUser.created_at
          });
          router.push('/dashboard');
        } else {
          // Create new user
          const newUserData = {
            email: authUser.email,
            Name: authUser.user_metadata?.full_name || authUser.email.split('@')[0],
            pfp: authUser.user_metadata?.avatar_url || null,
            credits: 100, // DECISION: Default credits set to 100 for new users
            created_at: new Date().toISOString()
          };

          const { data: createdUser, error: createError } = await supabase
            .from('Users')
            .insert([newUserData])
            .select()
            .single();

          if (createError) {
            console.error('Error creating user:', createError);
            setLoading(false);
            return;
          }

          setUser({
            Name: createdUser.Name,
            email: createdUser.email,
            pfp: createdUser.pfp,
            credits: createdUser.credits,
            created_at: createdUser.created_at
          });
          router.push('/dashboard');
        }
      } catch (error) {
        console.error('Unexpected error during auth check:', error);
      } finally {
        setLoading(false);
      }
    };

    checkUserAndFetch();
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: 'var(--bg-surface)' }}>
        <div 
          className="w-8 h-8 border-3 border-t-transparent rounded-full"
          style={{ 
            borderColor: 'var(--primary-blue)',
            borderTopColor: 'transparent',
            animation: 'spin 1s linear infinite'
          }}
        />
      </div>
    );
  }

  return (
    <UserDetailContext.Provider value={{ user, setUser }}>
      <ResumeAnalysisProvider>
        {children}
      </ResumeAnalysisProvider>
    </UserDetailContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserDetailContext);
  if (!context) {
    throw new Error('useUser must be used within a Provider');
  }
  return context;
}
