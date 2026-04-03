"use client"
import { useState } from "react";
import { supabase } from "@/services/supabaseClient";

export default function AuthPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      setError(null);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });
      if (error) {
        console.log('Auth error:', error);
        setError(error.message);
      }
    } catch (err) {
      console.error('Unexpected auth error:', err);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-center p-4"
      style={{ background: 'var(--bg-surface)' }}
    >
      {/* Card */}
      <div 
        className="card w-full relative overflow-hidden"
        style={{ maxWidth: '420px', padding: '0' }}
      >
        {/* Blue accent line */}
        <div 
          style={{
            height: '3px',
            background: 'var(--primary-blue)',
            borderRadius: '12px 12px 0 0'
          }}
        />

        <div className="p-10">
          {/* Wordmark */}
          <h1 
            className="text-center mb-2"
            style={{
              fontSize: '24px',
              fontWeight: 700,
              color: 'var(--primary-blue)'
            }}
          >
            PlacementMentor
          </h1>

          {/* Tagline */}
          <p 
            className="text-center mb-8"
            style={{
              fontSize: '14px',
              color: 'var(--text-secondary)'
            }}
          >
            Used by students preparing for top placements
          </p>

          {/* Error message */}
          {error && (
            <div 
              className="mb-4 p-3 rounded-lg text-center text-sm"
              style={{
                background: '#FEF2F2',
                color: 'var(--error)',
                border: '1px solid #FECACA'
              }}
            >
              {error}
            </div>
          )}

          {/* Google Sign In Button */}
          <button
            onClick={signInWithGoogle}
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-3"
            style={{ padding: '12px 20px' }}
          >
            {loading ? (
              <div 
                className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                style={{ animation: 'spin 1s linear infinite' }}
              />
            ) : (
              <>
                {/* Google SVG Icon */}
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </>
            )}
          </button>
        </div>
      </div>

      {/* Footer text */}
      <p 
        className="mt-6 text-center"
        style={{
          color: 'var(--text-muted)',
          fontSize: '12px',
          maxWidth: '320px'
        }}
      >
        By continuing, you agree to our Terms and Privacy Policy
      </p>
    </div>
  );
}
