import Image from 'next/image'
import React from 'react'

function InterviewHeader() {
  return (
    <div className='p-4 shadow-sm'>
      <Image src="/2.png" alt="Interview Header" width={200} height={150} className='w-[140px]' />
    </div>
  )
}

export default InterviewHeader