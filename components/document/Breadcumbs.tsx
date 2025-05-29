import { usePathname } from 'next/navigation'
import React, { Fragment } from 'react'
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
  } from "@/components/ui/breadcrumb"

import { House } from 'lucide-react';  
import { SignedIn , SignedOut } from '@clerk/nextjs';

  

function Breadcumbs() {
    const path = usePathname();
    const segments = path.split('/');
  return (
    <Breadcrumb>
        <BreadcrumbList>
            <BreadcrumbItem className=''>
                <BreadcrumbLink href="/">
                    <SignedOut>
                        <div className='flex-row flex items-center text-white '>
                            <House className='mr-2 size-8 '/>
                            <span className='text-[18px]'>Home</span>
                        </div>
                    </SignedOut>
                    <SignedIn>
                        <div className='flex-row flex items-center justify-center text-white '>
                            Home
                        </div>
                    </SignedIn>                    
                </BreadcrumbLink>
            </BreadcrumbItem>
            {segments.map((segment, index) => {
                    if(!segment) return null; 
                    const href = `/${segments.slice(0, index + 1).join('/')}`;
                    const isLast = index === segments.length - 1;
                    return (
                        <Fragment key={segment}>
                            <BreadcrumbSeparator></BreadcrumbSeparator>
                            <BreadcrumbItem  className={`${isLast ? 'text-[18px] text-white ' : 'text-white'}`} key={segment}>
                            {isLast ? (
                                <BreadcrumbPage className='text-white '>                                
                                    {segment}
                                </BreadcrumbPage>
                            ) : (
                                <BreadcrumbLink href={href}>{segment}</BreadcrumbLink>
                            )}
                                
                            </BreadcrumbItem>
                        </Fragment>
                    )
            }
                
            )}
        </BreadcrumbList>
    </Breadcrumb>

  )
}

export default Breadcumbs
