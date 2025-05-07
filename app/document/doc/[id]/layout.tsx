import RoomProvider from '@/components/Notion/RoomProvider'
import Sidebar from '@/components/Notion/Sidebar'
import { auth } from '@clerk/nextjs/server'
import React from 'react'

function DocLayout({children , params : {id}} : {
    children: React.ReactNode,
    params : {id : string}
}) {
    // auth().protect();
  return (
    
          <RoomProvider roomId={id}>
          {children}
        </RoomProvider>

  )
}

export default DocLayout
