'use client'

import React, { useState } from 'react'
import { SignedIn, SignedOut, SignInButton, UserButton, useUser } from '@clerk/nextjs'
import { Calendar, ChevronDown, ChevronUp, File } from 'lucide-react';
import Breadcumbs from './Breadcumbs';
import { Button } from '../ui/button';
import { useRouter } from 'next/navigation';

const Header = () => {
    const { user } = useUser();
    const [isToggleOn, setIsToggleOn] = useState(false);


    const router = useRouter()
    
      const handleNavCalender = () => {
        router.push('/calender')
      }
      const handleNavDocument = () => {
        router.push('/document')
      }
  return (
    <div className='flex flex-col'>
      <div className='flex items-center justify-between p-5'>
        {user && (
          <h1 className='text-2xl'>
              {user?.firstName} {`'s`} Space
              {isToggleOn == true ? 
              <ChevronUp className='inline-block ml-2 hover:cursor-pointer' onClick={() => setIsToggleOn(!isToggleOn)} size={20}/> 
              :
              <ChevronDown className='inline-block ml-2 hover:cursor-pointer' onClick={() => setIsToggleOn(!isToggleOn)} size={20}/>}
          </h1>
        )}

        {/* Breadcrumbs */}
        <Breadcumbs></Breadcumbs>
        

        <div>
          <SignedOut>
            <div className='flex items-center  bg-black text-white p-2 rounded-lg'>
              <SignInButton/>
            </div>
          </SignedOut>

          <SignedIn>
              <UserButton/>
          </SignedIn>
        </div>
        </div>
      

      {isToggleOn && (
           <div className='p-5 flex gap-5'>
            <Button className=' ' onClick={handleNavCalender} >
                <Calendar className='mr-2'/>
                Calender
            </Button>
                
            <Button onClick={handleNavDocument} className=' '>
                <File className='mr-2'/>
                Document
            </Button>
          </div> 
      )}
    </div>
  )
}

export default Header
