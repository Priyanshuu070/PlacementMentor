import React from 'react'
import Provider from '../provider'
import { Toaster } from 'sonner'
import Navbar from './dashboard/_components/Navbar'

function DashboardLayout({children}) {
  return (
    <Provider>
      <Navbar />
      <div style={{ minHeight: 'calc(100vh - 64px)' }}>
        {children}
      </div>
      <Toaster />
    </Provider>
  )
}

export default DashboardLayout