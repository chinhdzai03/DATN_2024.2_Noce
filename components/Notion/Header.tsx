'use client'

import React, { useState } from 'react'
import { SignedIn, SignedOut, SignInButton, UserButton, useUser } from '@clerk/nextjs'
import { Calendar, ChevronDown, ChevronUp, File, Trello } from 'lucide-react';
import Breadcumbs from './Breadcumbs';
import { Button } from '../ui/button';
import { useRouter, usePathname } from 'next/navigation';
import { House } from 'lucide-react';

const Header = () => {
    const { user, isLoaded } = useUser();
    const router = useRouter();
    const pathname = usePathname();

    if (!isLoaded) {
        return <div>Loading...</div>;
    }

    // Hàm xác định active
    const isActive = (path: string) => pathname.startsWith(path);

    const navItems = [
      { label: 'Document', icon: <File className=''/>, path: '/document' },
      { label: 'Calender', icon: <Calendar className=''/>, path: '/calender' },
      { label: 'Task', icon: <Trello className=''/>, path: '/task' },
    ];

    return (
      <div className='flex flex-col '>
        <div className='flex items-center justify-between p-5 ' style={{ background: '#1a1a1a', color: 'white' }}>
        <SignedIn>
          <div className='flex items-center '>
            
            {user && (
              <h1 className='text-2xl font-bold '>
                {user?.firstName} {`'s`} Space
              </h1>
            )}
            {/* Divider */}
            
              <div className='border-white border-2 h-10 ml-6'>
              </div>
              <div className='flex gap-3 ml-6'>
                {navItems.map(item => (
                  <Button
                    key={item.label}
                    onClick={() => router.push(item.path)}
                    className={`flex items-center px-4 py-2 rounded-lg transition-colors ${isActive(item.path) ? 'bg-white text-[#1a1a1a] font-bold' : 'bg-[#313131] text-white/70'}`}
                    variant="ghost"
                  >
                    {item.icon}
                    {item.label}
                  </Button>
                ))}
              </div>
                      
          </div>
          </SignedIn>  
          <Breadcumbs />

          <div>
            <SignedOut>
              <div className='flex items-center  bg-white text-black p-3 rounded-2xl'>
                <SignInButton/>
              </div>
            </SignedOut>

            <SignedIn>
                <UserButton  />
            </SignedIn>
          </div>
        </div>
      </div>
    );
}

export default Header
