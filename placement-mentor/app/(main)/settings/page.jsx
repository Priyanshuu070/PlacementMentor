"use client"
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Lock, CreditCard, LogOut } from "lucide-react";
import { supabase } from "@/services/supabaseClient";
import { useUser } from "@/app/provider";
import { toast } from "sonner";

export default function SettingsPage() {
  const router = useRouter();
  const { user, setUser } = useUser();

  const [name, setName] = useState('');
  const [originalName, setOriginalName] = useState('');
  const [saving, setSaving] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    if (user?.Name) {
      setName(user.Name);
      setOriginalName(user.Name);
    }
  }, [user?.Name]);

  const isNameChanged = name.trim() !== originalName && name.trim().length >= 2;

  const handleSave = async () => {
    if (!isNameChanged) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('Users')
        .update({ Name: name.trim() })
        .eq('email', user.email);

      if (error) {
        console.error('Error updating profile:', error);
        toast.error('Failed to update profile');
        return;
      }

      setUser({ ...user, Name: name.trim() });
      setOriginalName(name.trim());
      toast.success('Profile updated successfully');
    } catch (err) {
      console.error('Unexpected error:', err);
      toast.error('An error occurred');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error signing out:', error);
        toast.error('Failed to sign out');
        return;
      }
      router.push('/auth');
    } catch (err) {
      console.error('Unexpected error:', err);
      toast.error('An error occurred');
    } finally {
      setLoggingOut(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric'
    });
  };

  const getInitial = () => {
    if (user?.Name) {
      return user.Name.charAt(0).toUpperCase();
    }
    return '?';
  };

  return (
    <div className="max-w-[600px] mx-auto px-6 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 
          className="text-2xl font-bold mb-1"
          style={{ color: 'var(--text-primary)' }}
        >
          Settings
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Manage your profile information
        </p>
      </div>

      {/* Card 1: Profile Information */}
      <div className="card p-8 mb-6">
        {/* Avatar */}
        <div className="flex flex-col items-center mb-8">
          {user?.pfp ? (
            <img 
              src={user.pfp} 
              alt={user.Name || 'User'} 
              className="w-20 h-20 rounded-full object-cover mb-2"
            />
          ) : (
            <div 
              className="w-20 h-20 rounded-full flex items-center justify-center mb-2"
              style={{ 
                background: 'var(--primary-blue)',
                color: 'white',
                fontSize: '32px',
                fontWeight: 600
              }}
            >
              {getInitial()}
            </div>
          )}
          <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
            Profile Picture
          </span>
        </div>

        {/* Display Name */}
        <div className="mb-6">
          <label 
            className="block mb-2"
            style={{ fontWeight: 500, color: 'var(--text-primary)', fontSize: '14px' }}
          >
            Display Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value.slice(0, 50))}
            className="w-full rounded-lg p-3"
            style={{
              border: '1px solid var(--border-default)',
              color: 'var(--text-primary)',
              outline: 'none'
            }}
            onFocus={(e) => e.target.style.borderColor = 'var(--primary-blue)'}
            onBlur={(e) => e.target.style.borderColor = 'var(--border-default)'}
          />
          {name.trim().length > 0 && name.trim().length < 2 && (
            <p className="mt-1 text-sm" style={{ color: 'var(--error)' }}>
              Name must be at least 2 characters
            </p>
          )}
        </div>

        {/* Email (Read-only) */}
        <div className="mb-6">
          <label 
            className="block mb-2"
            style={{ fontWeight: 500, color: 'var(--text-primary)', fontSize: '14px' }}
          >
            Email Address
          </label>
          <div className="relative">
            <input
              type="email"
              value={user?.email || ''}
              readOnly
              className="w-full rounded-lg p-3 pr-10"
              style={{
                border: '1px solid var(--border-default)',
                background: 'var(--bg-surface)',
                color: 'var(--text-secondary)',
                outline: 'none'
              }}
            />
            <Lock 
              size={16} 
              className="absolute right-3 top-1/2 -translate-y-1/2"
              style={{ color: 'var(--text-muted)' }}
            />
          </div>
        </div>

        {/* Member Since */}
        {user?.created_at && (
          <div className="mb-6">
            <label 
              className="block mb-2"
              style={{ fontWeight: 500, color: 'var(--text-primary)', fontSize: '14px' }}
            >
              Member Since
            </label>
            <p style={{ color: 'var(--text-secondary)' }}>
              {formatDate(user.created_at)}
            </p>
          </div>
        )}

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={!isNameChanged || saving}
          className="btn-primary w-full"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* Card 2: Account Information */}
      <div className="card p-8 mb-6">
        <div className="flex items-start gap-4">
          <div 
            className="p-3 rounded-lg"
            style={{ background: 'var(--primary-blue-light)' }}
          >
            <CreditCard size={24} style={{ color: 'var(--primary-blue)' }} />
          </div>
          <div>
            <p 
              className="text-3xl font-bold"
              style={{ color: 'var(--primary-blue)' }}
            >
              {user?.credits ?? 0}
            </p>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
              credits remaining
            </p>
            <p 
              className="mt-2"
              style={{ color: 'var(--text-muted)', fontSize: '13px' }}
            >
              Account Type: Free Account
            </p>
          </div>
        </div>
      </div>

      {/* Card 3: Sign Out */}
      <div 
        className="card p-8"
        style={{ borderLeft: '3px solid var(--error)' }}
      >
        <h3 
          className="font-semibold mb-2"
          style={{ color: 'var(--text-primary)' }}
        >
          Sign Out
        </h3>
        <p 
          className="mb-4"
          style={{ color: 'var(--text-secondary)', fontSize: '14px' }}
        >
          Sign out of your PlacementMentor account
        </p>
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors"
          style={{
            border: '1px solid var(--error)',
            color: 'var(--error)',
            background: 'transparent'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = 'var(--error)';
            e.target.style.color = 'white';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'transparent';
            e.target.style.color = 'var(--error)';
          }}
        >
          <LogOut size={18} />
          {loggingOut ? 'Signing out...' : 'Sign Out'}
        </button>
      </div>
    </div>
  );
}
