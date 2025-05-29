import { ArrowLeftCircle } from 'lucide-react'
import React from 'react'

export default function DocumentNote () {
  return (
    <main className="pt-4 flex space-x-2 items-center animate-pulse">
      <ArrowLeftCircle className="w-12 h-12"/>
      <h1 className="font-bold">
          Get started with creating a New Document
      </h1>
      <div className="absolute bottom-0 right-0 w-[40%] h-auto z-0 animate-slide-in-right">
        <img src="/img/a3.jpg" alt="img1" className="w-full h-full object-cover" />
      </div>
    </main>
  )
}