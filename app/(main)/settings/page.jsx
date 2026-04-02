"use client";
import React, { useState, useEffect } from 'react';
import { Lock, CreditCard, LogOut } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useUser } from '@/app/provider';
import { supabase } from '@/services/supabaseClient';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

function Settings() {
  const { user, setUser } = useUser();
  const router = useRouter();
  const [displayName, setDisplayName] = useState('');
  const [originalName, setOriginalName] = useState('');
  const [saving, setSaving] = useState(false);

  // Initialize on mount
  useEffect(() => {
    if (user?.Name) {
      setDisplayName(user.Name);
      setOriginalName(user.Name);
    }
  }, [user]);

  // Check if changes exist and name is valid
  const hasChanges = displayName !== originalName && displayName.trim().length >= 2;
  const nameError = displayName.trim().length > 0 && displayName.trim().length < 2 
    ? 'Name must be at least 2 characters' 
    : displayName.trim().length === 0 && displayName.length > 0
    ? 'Name cannot be empty'
    : '';

  // Format Member Since date
  const formatMemberSince = (timestamp) => {
    if (!timestamp) return null;
    const date = new Date(timestamp);
    const month = date.toLocaleString('default', { month: 'long' });
    const year = date.getFullYear();
    return `${month} ${year}`;
  };

  // Handle Save Profile
  const handleSaveProfile = async () => {
    if (displayName.trim().length < 2 || displayName.trim().length > 50) {
      toast.error('Name must be between 2 and 50 characters');
      return;
    }

    setSaving(true);
    
    try {
      const { data, error } = await supabase
        .from('Users')
        .update({ Name: displayName.trim() })
        .eq('email', user.email)
        .select()
        .single();
      
      if (error) throw error;
      
      // Update context with new data
      setUser(data);
      
      // Update local state to match
      setOriginalName(displayName.trim());
      setDisplayName(data.Name);
      
      toast.success('Profile updated successfully');
    } catch (err) {
      console.error('Error updating profile:', err);
      toast.error('Failed to update profile. Try again.');
    } finally {
      setSaving(false);
    }
  };

  // Handle Sign Out
  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      router.push('/auth');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Failed to sign out. Please try again.');
    }
  };

  return (
    <div style={{
      maxWidth: '600px',
      margin: '0 auto',
      padding: '40px 24px'
    }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{
          fontSize: '28px',
          fontWeight: 700,
          color: 'var(--text-primary)',
          marginBottom: '4px'
        }}>
          Settings
        </h1>
        <p style={{
          fontSize: '14px',
          color: 'var(--text-secondary)'
        }}>
          Manage your profile information
        </p>
      </div>

      {/* SECTION 1: Profile Information */}
      <div style={{
        backgroundColor: 'var(--bg-white)',
        border: '1px solid var(--border-default)',
        borderRadius: '12px',
        padding: '32px',
        marginBottom: '24px'
      }}>
        <h2 style={{
          fontSize: '18px',
          fontWeight: 600,
          color: 'var(--text-primary)',
          marginBottom: '24px'
        }}>
          Profile Information
        </h2>

        {/* Profile Picture */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          {user?.pfp ? (
            <img 
              src={user.pfp} 
              alt="Profile"
              style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                objectFit: 'cover',
                margin: '0 auto'
              }}
            />
          ) : (
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              backgroundColor: 'var(--primary-blue)',
              color: 'white',
              fontSize: '32px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto'
            }}>
              {user?.Name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
          )}
          <div style={{
            fontSize: '14px',
            color: 'var(--text-secondary)',
            marginTop: '8px'
          }}>
            Profile Picture
          </div>
        </div>

        {/* Display Name */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: 500,
            color: 'var(--text-primary)',
            marginBottom: '8px'
          }}>
            Display Name
          </label>
          <Input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Enter your name"
            maxLength={50}
            style={{
              borderColor: nameError ? 'var(--error)' : 'var(--border-default)'
            }}
          />
          {nameError && (
            <p style={{
              color: 'var(--error)',
              fontSize: '13px',
              marginTop: '4px'
            }}>
              {nameError}
            </p>
          )}
        </div>

        {/* Email */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: 500,
            color: 'var(--text-primary)',
            marginBottom: '8px'
          }}>
            Email Address
          </label>
          <div style={{ position: 'relative' }}>
            <Input
              value={user?.email || ''}
              disabled
              style={{
                backgroundColor: 'var(--bg-surface)',
                cursor: 'not-allowed',
                paddingRight: '36px'
              }}
            />
            <Lock 
              size={16} 
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-secondary)'
              }}
            />
          </div>
          <p style={{
            fontSize: '12px',
            color: 'var(--text-secondary)',
            marginTop: '4px'
          }}>
            Email cannot be changed
          </p>
        </div>

        {/* Member Since */}
        {user?.created_at && (
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: 500,
              color: 'var(--text-primary)',
              marginBottom: '8px'
            }}>
              Member Since
            </label>
            <div style={{
              fontSize: '14px',
              color: 'var(--text-secondary)',
              padding: '12px',
              backgroundColor: 'var(--bg-surface)',
              borderRadius: '8px'
            }}>
              {formatMemberSince(user.created_at)}
            </div>
          </div>
        )}

        {/* Save Button */}
        <button
          onClick={handleSaveProfile}
          disabled={!hasChanges || saving}
          className="btn-primary"
          style={{
            width: '100%',
            opacity: (!hasChanges || saving) ? 0.5 : 1,
            cursor: (!hasChanges || saving) ? 'not-allowed' : 'pointer'
          }}
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* SECTION 2: Account Information */}
      <div style={{
        backgroundColor: 'var(--bg-white)',
        border: '1px solid var(--border-default)',
        borderRadius: '12px',
        padding: '32px',
        marginBottom: '24px'
      }}>
        <h2 style={{
          fontSize: '18px',
          fontWeight: 600,
          color: 'var(--text-primary)',
          marginBottom: '24px'
        }}>
          Account Information
        </h2>

        {/* Credits */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingBottom: '16px',
          borderBottom: '1px solid var(--border-default)',
          marginBottom: '16px'
        }}>
          <span style={{
            fontSize: '14px',
            color: 'var(--text-secondary)'
          }}>
            Credits Remaining
          </span>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <CreditCard size={20} style={{ color: 'var(--primary-blue)' }} />
            <span style={{
              fontSize: '24px',
              fontWeight: 700,
              color: 'var(--primary-blue)'
            }}>
              {user?.credits || 0}
            </span>
          </div>
        </div>

        {/* Account Type */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span style={{
            fontSize: '14px',
            color: 'var(--text-secondary)'
          }}>
            Account Type
          </span>
          <span style={{
            fontSize: '14px',
            fontWeight: 500,
            color: 'var(--text-primary)'
          }}>
            Free Account
          </span>
        </div>
      </div>

      {/* SECTION 3: Danger Zone */}
      <div style={{
        backgroundColor: 'var(--bg-white)',
        border: '1px solid var(--border-default)',
        borderLeft: '3px solid var(--error)',
        borderRadius: '12px',
        padding: '32px'
      }}>
        <h2 style={{
          fontSize: '18px',
          fontWeight: 600,
          color: 'var(--text-primary)',
          marginBottom: '8px'
        }}>
          Sign Out
        </h2>
        <p style={{
          fontSize: '14px',
          color: 'var(--text-secondary)',
          marginBottom: '24px'
        }}>
          Sign out of your PlacementMentor account
        </p>
        <button
          onClick={handleSignOut}
          style={{
            backgroundColor: 'var(--bg-white)',
            color: 'var(--error)',
            border: '1px solid var(--error)',
            padding: '12px 24px',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--error)';
            e.currentTarget.style.color = 'white';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--bg-white)';
            e.currentTarget.style.color = 'var(--error)';
          }}
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </div>
  );
}

export default Settings;