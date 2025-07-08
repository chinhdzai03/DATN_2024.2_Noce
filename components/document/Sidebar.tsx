'use client'
import React, { useEffect , useState } from 'react'
import NewDocumentButton from './NewDocumentButton'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { MenuIcon, Calendar, ArrowUpDown, ArrowDown, ArrowDownIcon } from 'lucide-react'
import { useCollection } from 'react-firebase-hooks/firestore';
import { useUser } from '@clerk/nextjs'
import { collectionGroup ,DocumentData,query , where } from 'firebase/firestore'
import { db } from '@/firebase'
import SidebarOption from './SidebarOption'
import { Button } from '../ui/button'
import { useRouter } from 'next/navigation'

type Tag = {
  label: string;
  value: string;
  color: string; // màu dạng Tailwind hoặc hex
};

const TAGS: Tag[] = [
  { label: 'Mục tiêu', value: 'Mục tiêu', color: 'bg-red-600' },
  { label: 'Học tập', value: 'Học tập', color: 'bg-pink-500' },
  { label: 'Công việc', value: 'Công việc', color: 'bg-orange-500' },
  { label: 'Sở thích', value: 'Sở thích', color: 'bg-yellow-400' },
  { label: 'Tài chính', value: 'Tài chính', color: 'bg-green-500' },
  { label: 'Giải trí', value: 'Giải trí', color: 'bg-blue-600' },
];

interface RoomDocument extends DocumentData {
  createdAt : string ;
  role: "owner" | "editor";
  roomId : string;
  userId: string
}

function Sidebar() {
  const {user} = useUser();
  const[groupedData , setGroupedData] = useState<{
    owner : RoomDocument[];
    editor : RoomDocument[]
  }>({
    owner : [],
    editor : []
  });
 
 
  const [data , loading , error ] = useCollection(
    user && (
      query(collectionGroup(db, 'rooms'), where('userId', '==', user.emailAddresses[0].toString()))
    )
  );

  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const handleToggle = (tagValue: string) => {
    let updatedTags = selectedTags.includes(tagValue)
      ? selectedTags.filter((v) => v !== tagValue)
      : [...selectedTags, tagValue];
    setSelectedTags(updatedTags);
    // onFilterChange(updatedTags); // Gửi về cha để lọc
  };
  
  const [isTooggleOpen, setIsToggleOpen] = useState(false);
  
  useEffect(() => {
    if (!data) return;

    const grouped = data.docs.reduce<{
      owner : RoomDocument[];
      editor : RoomDocument[]
    }>(
      (acc,curr) => {
        const roomData = curr.data() as RoomDocument;

        if ( roomData.role === 'owner') {
          acc.owner.push({
            id: curr.id,
            ...roomData,
          });

        }else {
          acc.editor.push({
            id: curr.id,
            ...roomData,
          })
        }

        return acc;
      },  {
        owner : [],
        editor : []
      }
    )
    setGroupedData(grouped);
    // console.log("Grouped Data:", grouped);
  }, [data]);

  const router = useRouter()

  const handleNavCalender = () => {
    router.push('/calender')
  }

  const menuOptions = (
    <>
      <div className='flex items-center justify-between'>
        <NewDocumentButton />
        <div>
          <ArrowDownIcon onClick={() => setIsToggleOpen(!isTooggleOpen)} className='p-2 hover:opacity-30 rounded-lg' size={40} />
        </div>
        {isTooggleOpen && (
          <div className='absolute top-16 right-4 bg-white shadow-lg rounded-lg p-4 z-10'>
            <h3 className='text-gray-700 font-semibold mb-2'>Lọc</h3>
            <div className='flex flex-col flex-warp gap-2'>
              {TAGS.map((tag) => (
                <li key={tag.value} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    id={tag.value}
                    checked={selectedTags.includes(tag.value)}
                    onChange={() => handleToggle(tag.value)}
                    className="accent-white"
                  />
                  <span className={`w-3 h-3 rounded ${tag.color}`}></span>
                  <label htmlFor={tag.value} className="text-sm cursor-pointer">
                    {tag.label}
                  </label>
                </li>
              ))}
            </div>
          </div>
        )}
      </div>
      {/* Other menu options */}
      <div className='pt-2'>
        {groupedData.owner.length === 0 ? (
            <h2 className='text-gray-500 font-semibold text-sm'>
              No documents found
            </h2>
        ) : (
          <>

            <h2 className='text-gray-500 font-semibold text-sm mb-2'>
              My Documents
            </h2>
            {selectedTags.length > 0 && (
              <h3 className='text-gray-500 font-semibold text-xs mb-2'>
                Loại: {selectedTags.join(', ')}
              </h3>
            )}
            {groupedData.owner.map((doc) => 
              { 
                const tagColor = TAGS.find(tag => tag.value === doc.type)?.color || 'bg-gray-500';
                if (selectedTags.length > 0) {
                  if (selectedTags.includes(doc.type)) {
                    
                    return <SidebarOption key={doc.id} id={doc.id} color={tagColor} href={`/document/doc/${doc.id}`}/>
                  }
                } else {
                  return <SidebarOption key={doc.id} id={doc.id} color={tagColor} href={`/document/doc/${doc.id}`}/>
                }
              }
            
            )}
          </>

        )}
      

      {/* Shared with Me */}
      {groupedData.editor.length > 0 && (
        <>
          <h2 className='text-gray-500 font-semibold text-sm pt-2 pb-2'>Shared with Me</h2>
          {groupedData.editor.map((doc) => (
            <SidebarOption key={doc.id} id={doc.id} href={`/document/doc/${doc.id}`}/>
          ))}
        </>
      )}
      </div>
      {/* sidebar */}
      {/* <div className='w-full justify-center flex'>
        <Button className=' absolute bottom-32 w-30 ' onClick={handleNavCalender} >
            <Calendar className='mr-2'/>
            Calender
        </Button>
      </div> */}
    </>
  )

  return (
    <div className='p-2 w-100 md:p-5 bg-gray-100 relative'>
       <div className='md:hidden'>
          <Sheet>
            <SheetTrigger>
                <MenuIcon className="p-2 hover:opacity-30 rounded-lg" size={40}/>
            </SheetTrigger>
            <SheetContent side='left'>
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
                <div className='h-full'>
                    {menuOptions}
                </div>
              </SheetHeader>
            </SheetContent>
          </Sheet>
       </div>
        <div className='hidden md:inline h-full'>
          {menuOptions}
        </div>
    </div>
  )
}

export default Sidebar
