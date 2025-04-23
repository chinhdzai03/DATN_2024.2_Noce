'use client'

import React from 'react'
import { SignedIn, SignedOut, SignInButton, UserButton, useUser } from '@clerk/nextjs'
import { User } from 'lucide-react';
import Breadcumbs from './Breadcumbs';

const Header = () => {
    const { user } = useUser();

  return (
    <div className='flex items-center justify-between p-5'>
      {user && (
        <h1 className='text-2xl'>
             {user?.firstName} {`'s`} Space
        </h1>
      )}

      {/* Breadcrumbs */}
      <Breadcumbs></Breadcumbs>
      

      <div>
        <SignedOut>
            <SignInButton/>
        </SignedOut>

        <SignedIn>
            <UserButton/>
        </SignedIn>
      </div>
    </div>
  )
}

export default Header
