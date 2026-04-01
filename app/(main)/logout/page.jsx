"use client"
import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { supabase } from '@/services/supabaseClient'
import { LogOut, CheckCircle, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

function SignOut() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [signedOut, setSignedOut] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const signOutUser = async () => {
      try {
        setLoading(true)
        
        // Sign out from Supabase
        const { error } = await supabase.auth.signOut()
        
        if (error) {
          // Error signing out
          setError(error.message)
        } else {
          setSignedOut(true)
          // Redirect to home page after 2 seconds
          setTimeout(() => {
            router.push('/')
          }, 2000)
        }
      } catch (err) {
        // Unexpected error during sign out
        setError('An unexpected error occurred')
      } finally {
        setLoading(false)
      }
    }

    signOutUser()
  }, [router])

  const handleGoHome = () => {
    router.push('/')
  }

  return (
    <div className='flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4'>
      <div className='flex flex-col items-center bg-white p-8 rounded-3xl shadow-lg w-full max-w-md'>
        {/* Logo */}
        <div className='mb-6 flex justify-center'>
          <Image 
            src="/NexprepLogo.png" 
            alt="NexPrep Logo" 
            width={140} 
            height={40} 
            className='h-auto object-contain' 
            priority
          />
        </div>

        {/* Loading State */}
        {loading && (
          <div className='text-center'>
            <div className='w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mb-6 mx-auto'>
              <LogOut className='h-8 w-8 text-white animate-pulse' />
            </div>
            <h2 className='text-2xl font-bold text-gray-900 mb-2'>Signing you out...</h2>
            <p className='text-gray-600'>Please wait while we securely log you out.</p>
            <div className='mt-4'>
              <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto'></div>
            </div>
          </div>
        )}

        {/* Success State */}
        {!loading && signedOut && !error && (
          <div className='text-center'>
            <div className='w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6 mx-auto'>
              <CheckCircle className='h-8 w-8 text-green-600' />
            </div>
            <h2 className='text-2xl font-bold text-gray-900 mb-2'>Successfully signed out!</h2>
            <p className='text-gray-600 mb-6'>Thank you for using NexPrep. You have been securely logged out.</p>
            <p className='text-sm text-gray-500 mb-6'>Redirecting you to home page...</p>
            
            <button
              onClick={handleGoHome}
              className='flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg py-3 px-6 w-full transition-all shadow-md'
            >
              <ArrowLeft className='h-4 w-4' />
              Go to Home Page
            </button>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className='text-center'>
            <div className='w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6 mx-auto'>
              <LogOut className='h-8 w-8 text-red-600' />
            </div>
            <h2 className='text-2xl font-bold text-gray-900 mb-2'>Sign out failed</h2>
            <p className='text-gray-600 mb-4'>We encountered an error while signing you out:</p>
            <p className='text-red-600 text-sm mb-6 bg-red-50 p-3 rounded-lg'>{error}</p>
            
            <div className='space-y-3'>
              <button
                onClick={() => window.location.reload()}
                className='flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg py-3 px-6 w-full transition-all shadow-md'
              >
                Try Again
              </button>
              
              <button
                onClick={handleGoHome}
                className='flex items-center justify-center gap-2 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg py-3 px-6 w-full transition-all'
              >
                <ArrowLeft className='h-4 w-4' />
                Go to Home Page
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className='mt-8 text-center'>
          <p className='text-xs text-gray-400'>
            Need help? <Link href="#" className='text-blue-600 hover:underline'>Contact Support</Link>
          </p>
        </div>
      </div>

      {/* Additional Info Card */}
      {!loading && signedOut && (
        <div className='mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4 max-w-md w-full'>
          <div className='flex items-center gap-3'>
            <div className='w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center'>
              <CheckCircle className='h-4 w-4 text-blue-600' />
            </div>
            <div>
              <h4 className='font-semibold text-blue-900 text-sm'>Security Notice</h4>
              <p className='text-blue-700 text-xs'>Your session has been cleared and all data is secure.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SignOut