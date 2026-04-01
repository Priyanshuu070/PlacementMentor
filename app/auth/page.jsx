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
    <div className='flex flex-col items-center justify-center h-screen bg-gray-50'> 
      <div className='flex flex-col items-center bg-white p-0 rounded-3xl shadow-md w-[420px] overflow-hidden'>         {/* Logo top center - no background */}
        <div className='mt-4 mb-0 flex justify-center'>
          <Image 
            src="/NexprepLogo.png" 
            alt="Logo" 
            width={400} 
            height={100} 
            className='w-[140px] h-auto object-contain' 
            priority
          />
        </div>       
         <div className='w-full py-4 px-4 flex justify-center '>
          <Image  
            src="/Login.png" 
            alt="Login" 
            width={400} 
            height={400} 
            className='w-[340px] h-auto rounded-xl' 
          />
        </div>
        <div className='text-center pt-4 pb-5 px-6 w-full'>
          <h2 className='text-2xl font-bold text-gray-900 mb-1'>Welcome to NeXprep</h2>
          <p className='text-gray-500 mb-4'>Sign In With Google Authentication</p>        
            <button className='flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-3 px-6 w-full transition-all shadow-md' onClick={signInWithGoogle}>
            <svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 0 24 24" width="20">

              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              <path d="M1 1h22v22H1z" fill="none"/>
            </svg>
            <span className='font-medium'>Login with Google</span>
          </button>
        </div>
      </div>
    </div>

  )
}

export default Login