"use client";
import { Mic, Notebook } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

function CreateOptions() {
  return (
    <div className='grid grid-cols-2 gap-4'>
      <Link href='/dashboard/create-interview' className='bg-white border border-gray-200 p-6 rounded-lg hover:shadow-lg transition-shadow duration-200'>
        <div className='flex items-start gap-4'>
          <div className='flex-shrink-0'>
            <Mic className='p-3 text-primary bg-blue-50 rounded-lg h-14 w-14' />
          </div>
          <div>
            <h2 className='text-xl font-bold text-gray-800 mb-1'>Start AI Mock Interview</h2>
            <p className='text-gray-500'>Practice an interview with an AI interviewer. Get real-time feedback.</p>
          </div>
        </div>
      </Link>

      <Link href='/dashboard/practice' className='bg-white border border-gray-200 p-6 rounded-lg hover:shadow-lg transition-shadow duration-200'>
        <div className='flex items-start gap-4'>
          <div className='flex-shrink-0'>
            <Notebook className='p-3 text-primary bg-blue-50 rounded-lg h-14 w-14' />
          </div>
          <div>
            <h2 className='text-xl font-bold text-gray-800 mb-1'>NexPrep Vault</h2>
            <p className='text-gray-500'>A curated vault of high-quality resources to help you level up your interview prep, coding skills, and career journey</p>
          </div>
        </div>
      </Link>
    </div>
        
  )
}

export default CreateOptions