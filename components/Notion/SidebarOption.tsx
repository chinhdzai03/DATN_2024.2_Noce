'use client'
import { doc } from 'firebase/firestore';
import { db } from '@/firebase';
import Link from 'next/link';
import React from 'react'
import { useDocumentData } from 'react-firebase-hooks/firestore';
import { usePathname } from 'next/navigation';

function SidebarOption( {href , id } : {
    href : string;
    id : string
})  {

    const [data , loading , error ] = useDocumentData(doc(db,"documents",id));
    const pathname = usePathname();
    const isActive = href.includes(pathname) && pathname !== '/'


    if (!data)  return null;
  return (
        <Link href={href} className={`  w-1xl flex pl-2 pr-2  mb-2 items-center rounded-lg hover:bg-gray-200  ${isActive ? 'bg-gray-200 font-bold border-black' : 'border-gray-400'}`}>
             {/* Hiển thị icon nếu có */}
             {data.icon && (
               <span className='text-xl mr-2'>{data.icon}</span>
             )}
             <p className='truncate'>
                {data.title}
             </p>
        </Link>
  )
}

export default SidebarOption
