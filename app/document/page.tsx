import { ArrowLeftCircle } from 'lucide-react'
import React from 'react'

export default function DocumentNote () {
  return (
    <main className="pt-4 flex space-x-2 items-center animate-pulse">
      <ArrowLeftCircle className="w-12 h-12"/>
      <h1 className="font-bold">
          Get started with creating a New Document
      </h1>
    </main>
  )
}