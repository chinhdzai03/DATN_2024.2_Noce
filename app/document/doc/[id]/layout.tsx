import RoomProvider from '@/components/document/RoomProvider'
import Sidebar from '@/components/document/Sidebar'
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
