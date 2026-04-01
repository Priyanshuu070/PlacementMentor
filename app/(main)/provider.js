"use client";
import React from 'react'
import { AppSidebar } from './_components/AppSidebar'
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import WelcomeContainer from './dashboard/_components/WelcomeContainer'

function DashboardProvider({children}) {
  return (
    <SidebarProvider>
      <div className="flex w-full transition-all duration-200">
        <AppSidebar />
        <div className="flex-1 relative w-full transition-all duration-200">
            <div className="absolute top-4 left-4">
              <SidebarTrigger />
            </div>
            <div className="pt-16 w-full px-10">
                <WelcomeContainer />
              <div className="mt-2">
                {children}
              </div>
            </div>
        </div>
      </div>
    </SidebarProvider>
  )
}

export default DashboardProvider