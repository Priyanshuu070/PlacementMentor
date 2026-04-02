"use client"
import React from 'react'
import Image from 'next/image'
import { supabase } from '@/services/supabaseClient' 

function Login() {
  const signInWithGoogle =async () => {
    const {error}=await supabase.auth.signInWithOAuth({
      provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      
    })
    if (error) {
      // Error signing in with Google
    } else {
      // Sign in successful
    }
  }
  return (
    <div className='flex items-center justify-center min-h-screen' style={{backgroundColor: 'var(--bg-surface)'}}>
      <div className='bg-white rounded-xl shadow-lg w-full max-w-[420px] mx-4 overflow-hidden'>
        {/* Blue accent line at top of card */}
        <div style={{
          height: '3px', 
          backgroundColor: 'var(--primary-blue)',
          borderRadius: '12px 12px 0 0',
          marginBottom: '32px'
        }} />
        
        <div className='px-8 pb-8'>
          {/* PlacementMentor wordmark */}
          <h1 className='text-2xl font-bold text-center mb-2' style={{color: 'var(--text-primary)'}}>
            PlacementMentor
          </h1>
          
          {/* Tagline */}
          <p className='text-center mb-8' style={{color: 'var(--text-secondary)'}}>
            Used by students preparing for top placements
          </p>
          
          {/* Google Sign-In Button */}
          <button 
            className='btn-primary flex items-center justify-center gap-3 w-full'
            onClick={signInWithGoogle}
          >
            <svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 0 24 24" width="20">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              <path d="M1 1h22v22H1z" fill="none"/>
            </svg>
            <span>Continue with Google</span>
          </button>
        </div>
      </div>
      
      {/* Footer text */}
      <p className='absolute bottom-8 text-sm text-center px-4' style={{color: 'var(--text-muted)'}}>
        By continuing, you agree to our Terms and Privacy Policy
      </p>
    </div>
  )
}

export default Login