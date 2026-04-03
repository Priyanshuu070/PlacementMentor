"use client"
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { supabase } from "@/services/supabaseClient";
import { useUser } from "@/app/provider";

const navLinks = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/history', label: 'History' },
  { href: '/settings', label: 'Settings' },
];

export default function Navbar() {
  const { user } = useUser();
  const pathname = usePathname();
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error signing out:', error);
        return;
      }
      router.push('/auth');
    } catch (error) {
      console.error('Unexpected error during logout:', error);
    }
  };

  const getInitial = () => {
    if (user?.Name) {
      return user.Name.charAt(0).toUpperCase();
    }
    return '?';
  };

  return (
    <nav 
      className="sticky top-0 z-50 flex items-center justify-between px-6"
      style={{
        height: '64px',
        background: 'var(--bg-white)',
        borderBottom: '1px solid var(--border-default)'
      }}
    >
      {/* Left: Logo */}
      <Link 
        href="/dashboard"
        className="font-bold text-xl no-underline"
        style={{ color: 'var(--primary-blue)' }}
      >
        PlacementMentor
      </Link>

      {/* Center: Nav Links */}
      <div className="flex items-center gap-6">
        {navLinks.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className="relative py-5 text-sm font-medium no-underline transition-colors"
              style={{
                color: isActive ? 'var(--primary-blue)' : 'var(--text-secondary)',
              }}
            >
              {link.label}
              {isActive && (
                <span 
                  className="absolute bottom-0 left-0 right-0 h-0.5"
                  style={{ background: 'var(--primary-blue)' }}
                />
              )}
            </Link>
          );
        })}
      </div>

      {/* Right: User Menu */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-2 cursor-pointer bg-transparent border-none p-1"
        >
          {/* Avatar */}
          {user?.pfp ? (
            <img 
              src={user.pfp} 
              alt={user.Name || 'User'} 
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div 
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold"
              style={{ background: 'var(--primary-blue)' }}
            >
              {getInitial()}
            </div>
          )}
          
          {/* Name */}
          <span 
            className="text-sm font-medium hidden sm:inline"
            style={{ color: 'var(--text-primary)' }}
          >
            {user?.Name || 'User'}
          </span>
          
          <ChevronDown 
            size={16} 
            style={{ color: 'var(--text-secondary)' }}
            className={`transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}
          />
        </button>

        {/* Dropdown Menu */}
        {dropdownOpen && (
          <div 
            className="absolute right-0 top-full mt-1 w-48 rounded-lg shadow-lg py-1 z-50"
            style={{
              background: 'var(--bg-white)',
              border: '1px solid var(--border-default)'
            }}
          >
            <Link
              href="/settings"
              className="block px-4 py-2 text-sm no-underline transition-colors"
              style={{ color: 'var(--text-primary)' }}
              onClick={() => setDropdownOpen(false)}
              onMouseEnter={(e) => e.target.style.background = 'var(--bg-surface)'}
              onMouseLeave={(e) => e.target.style.background = 'transparent'}
            >
              Profile
            </Link>
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 text-sm bg-transparent border-none cursor-pointer transition-colors"
              style={{ color: 'var(--text-primary)' }}
              onMouseEnter={(e) => e.target.style.background = 'var(--bg-surface)'}
              onMouseLeave={(e) => e.target.style.background = 'transparent'}
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
