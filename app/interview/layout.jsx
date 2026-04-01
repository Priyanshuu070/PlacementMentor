"use client"
import React from 'react'
import InterviewHeader from './_components/InterviewHeader'
import { InterviewDetailsContext } from '@/context/InterviewDetails.context'


function Layout({ children }) {
  const [interviewData, setInterviewData] = React.useState(null);

  return (
    <InterviewDetailsContext.Provider value={[interviewData, setInterviewData]}>
      <div>
        <InterviewHeader />
        {children}
      </div>
    </InterviewDetailsContext.Provider>
  )
}

export default Layout