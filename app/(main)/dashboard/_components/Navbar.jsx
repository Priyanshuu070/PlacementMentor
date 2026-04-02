"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useUser } from '@/app/provider';
import { ChevronDown, User, LogOut } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useUser();
  const [showDropdown, setShowDropdown] = useState(false);

  const navLinks = [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'My Sessions', href: '/all-interviews' },
    { name: 'Settings', href: '/settings' }
  ];

  const isActive = (href) => pathname.startsWith(href);

  const handleLogout = () => {
    router.push('/logout');
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('[data-dropdown]')) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <nav style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      height: '64px',
      backgroundColor: 'var(--bg-white)',
      borderBottom: '1px solid var(--border-default)'
    }}>
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        height: '100%',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        {/* Left: Wordmark */}
        <Link href="/dashboard" style={{
          fontSize: '20px',
          fontWeight: 700,
          color: 'var(--primary-blue)',
          textDecoration: 'none'
        }}>
          PlacementMentor
        </Link>

        {/* Center: Nav Links */}
        <div style={{ display: 'flex', gap: '32px' }}>
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              style={{
                position: 'relative',
                color: isActive(link.href) ? 'var(--primary-blue)' : 'var(--text-secondary)',
                fontWeight: isActive(link.href) ? 600 : 400,
                textDecoration: 'none',
                paddingBottom: '4px',
                borderBottom: isActive(link.href) ? '2px solid var(--primary-blue)' : '2px solid transparent',
                transition: 'all 0.2s'
              }}
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Right: User Menu */}
        <div style={{ position: 'relative' }} data-dropdown>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '8px 12px',
              borderRadius: '8px',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer'
            }}
          >
            {/* Avatar */}
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: 'var(--primary-blue)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 600,
              fontSize: '14px'
            }}>
              {user?.Name ? user.Name.charAt(0).toUpperCase() : 'U'}
            </div>
            
            {/* Name */}
            <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
              {user?.Name || 'User'}
            </span>
            
            <ChevronDown size={16} style={{ color: 'var(--text-secondary)' }} />
          </button>

          {/* Dropdown */}
          {showDropdown && (
            <div style={{
              position: 'absolute',
              top: '48px',
              right: 0,
              width: '200px',
              backgroundColor: 'var(--bg-white)',
              border: '1px solid var(--border-default)',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              overflow: 'hidden'
            }}>
              <Link
                href="/settings"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  color: 'var(--text-primary)',
                  textDecoration: 'none',
                  borderBottom: '1px solid var(--border-default)'
                }}
                onClick={() => setShowDropdown(false)}
              >
                <User size={16} />
                Profile
              </Link>
              
              <button
                onClick={() => {
                  setShowDropdown(false);
                  handleLogout();
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  width: '100%',
                  border: 'none',
                  background: 'transparent',
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
