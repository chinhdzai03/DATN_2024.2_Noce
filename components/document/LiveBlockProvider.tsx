'use client'
import React from 'react'
import { LiveblocksProvider } from '@liveblocks/react/suspense'

function LiveBlockProvider( {children} : {
    children: React.ReactNode
} ) {
    if(!process.env.NEXT_PUBLIC_LIVEBLOCKS_PUBLIc_KEY){
      throw new Error('Missing public liveblocks key');
    }
        
  return (
    <LiveblocksProvider authEndpoint={'/auth-endpoint'} throttle={16}>
        {children}
    </LiveblocksProvider>
  )
    
   
  
}

export default LiveBlockProvider 
