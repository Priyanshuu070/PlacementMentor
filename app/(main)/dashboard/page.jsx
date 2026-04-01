"use client"
import React from 'react'
import CreateOptions from './_components/CreateOptions'
import LatestInterviews from './_components/LatestInterviews'

function DashboardPage() {
  return (
    <div className="w-full">
      <h2 className='my-3 text-2xl font-bold text-gray-800'>Dashboard</h2>
      <CreateOptions />
      <LatestInterviews />
    </div>
  )
}

export default DashboardPage