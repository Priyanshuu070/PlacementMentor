"use client"
import React from 'react'
import { useUser } from '@/app/provider'
import Image from 'next/image';

function WelcomeContainer() { 
  const { user } = useUser();
  
  return (
    <div  className="w-full mb-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm w-full flex items-center">
        <div className="flex-grow mr-10">
          <h2 className='text-xl font-bold text-gray-800'>Welcome {user?.Name || "User"}</h2>
          <h2 className='text-gray-500'>AI-driven Interviews, Hassle-Free Hiring</h2>
        </div>
        {user && (
          <div className="flex-shrink-0 ml-auto">
            <Image 
              src={user?.pfp || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.Name || "User")}`} 
              alt="User Avatar" 
              className="h-16 w-16 rounded-full object-cover" 
              width={64} 
              height={64}
              onError={(e) => {
                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.Name || "User")}`;
              }}
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default WelcomeContainer