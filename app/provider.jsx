"use client";
import { UserDetailContext } from '@/context/UserDetail.context';
import { ResumeAnalysisProvider } from '@/context/ResumeAnalysis.context';
import { supabase } from '@/services/supabaseClient';
import { useRouter } from 'next/navigation'; // ✅ correct for app dir
import React, { useEffect } from 'react';

function Provider({ children }) {
  const [user, setUser] = React.useState(null);
  const router = useRouter();

  useEffect(() => {
    // Provider mounted
    handleAuthAndUser();
  }, []);

  const handleAuthAndUser = async () => {
    try {
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError || !authData?.user) {
        // User not authenticated
        return;
      }

      const userEmail = authData.user.email;
      // Authenticated user found

      const { data: existingUser, error: fetchError } = await supabase
        .from('Users')
        .select('*')
        .eq('email', userEmail)
        .single(); // grabs one row, not an array

      if (fetchError && fetchError.code !== "PGRST116") {
        // Error checking user
        return;
      }

      if (!existingUser) {
        // User not found, creating new user
        const { data: insertedUser, error: insertError } = await supabase
          .from('Users')
          .insert([
            {
              Name: authData.user.user_metadata?.name || userEmail.split('@')[0],
              email: userEmail,
              pfp: authData.user.user_metadata?.picture || null,
              credits: 1, // Give 1 free credit to new users
            }
          ])
          .select()
          .single(); // fetch inserted row

        if (insertError) {
          // Error creating user
          return;
        }

        setUser(insertedUser);
      } else {
        setUser(existingUser);
      }

      // ✅ Only push once at the end
      router.push('/dashboard');

    } catch (err) {
      // Unexpected error occurred
    }
  };

  return (
    <UserDetailContext.Provider value={{ user, setUser }}>
      <ResumeAnalysisProvider>
        {children}
      </ResumeAnalysisProvider>
    </UserDetailContext.Provider>
  );
}

export default Provider;

export const useUser = () => {
  const context = React.useContext(UserDetailContext);
  return context;
};
