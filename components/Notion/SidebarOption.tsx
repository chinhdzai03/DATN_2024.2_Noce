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

        <Link href={href} className={` border w-1xl flex p-2 rounded-md mb-2 ${isActive ? 'bg-white font-bold border-black' : 'border-gray-400'}`}>
             <p className='truncate'>
                {data.title}
             </p>
        </Link>
  )
}

export default SidebarOption
