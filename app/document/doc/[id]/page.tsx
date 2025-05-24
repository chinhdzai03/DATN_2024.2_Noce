'use client'
import Document from '@/components/Notion/Document'
import React from 'react'

function DocumentPage({params : {id}}: {params : {id : string}}) {
  return (
    <div className=' flex flex-col flex-1 max-h-screen'>
      <Document id={id}/>
    </div>
  )
}

export default DocumentPage
