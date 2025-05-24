'use client'
import React , {FormEvent, useEffect, useState, useTransition } from 'react'
import { Input } from '../ui/input'
import { Button } from '../ui/button';
import { updateDoc ,doc } from 'firebase/firestore';
import { db } from '@/firebase';
import { useDocumentData } from 'react-firebase-hooks/firestore';
import Editor from './Editor';
import useOwner from '@/lib/useOwner';
import DeleteDocument from './DeleteDocument';
import InviteUser from './InviteUser';
import ManageUsers from './ManageUsers';
import Avatar from './Avatar';
import Avatars from './Avatar';
import dynamic from 'next/dynamic';

const EmojiPicker = dynamic(() => import('emoji-picker-react'), { ssr: false });

const Document = ({id} : {id : string}) => {
    const [data , loading , error] = useDocumentData(doc(db,"documents",id));
    const [input , setInput] = useState('');
    const [isUpdating,startTransiton] = useTransition();
    const [showEmoji, setShowEmoji] = useState(false);
    const isOwner = useOwner();

    useEffect(() => {
        if (data) {
            setInput(data.title);
        }
    },[data])
    const updateTitle = (e: FormEvent) => {
        e.preventDefault();
        if (input.trim()) {
            startTransiton(async () => {
                await updateDoc(doc(db,"documents",id),{title : input});
            })
        }
    }
    // Hàm cập nhật icon
    const updateIcon = async (icon: string) => {
        await updateDoc(doc(db, "documents", id), { icon });
    }
  return (
    <div className='flex-1 h-full bg-white p-5'>

      <div className='flex max-w-6xl mx-auto justify-between pb-5'>
            <form className='flex flex-1 space-x-2 items-center' onSubmit={updateTitle}>
                {/* Icon lớn phía trước title */}
                {data?.icon && (
                    <span
                        className='text-4xl mr-4 cursor-pointer'
                        onClick={() => setShowEmoji((v) => !v)}
                        title='Chọn icon'
                    >
                        {data.icon}
                    </span>
                )}
                {/* Emoji Picker */}
                {showEmoji && (
                    <div className='absolute z-50 mt-20'>
                        <EmojiPicker
                            onEmojiClick={(e) => {
                                updateIcon(e.emoji);
                                setShowEmoji(false);
                            }}
                            height={350}
                            width={300}
                        />
                    </div>
                )}
                {/* Update title... */}
                <Input
                    className='max-w-5xl'
                    value={input} onChange={(e) => setInput(e.target.value)}
                />
                <Button disabled={isUpdating} type='submit'>
                     {isUpdating ? "Updating..." : "Update"}
                </Button>
                {/* If */}
                {isOwner && (
                    <>
                    {/* InviteUser */}

                    {/* DeleteUser */}
                    <InviteUser/>
                    <DeleteDocument/>
                      
                    </>
                )}
            </form>
      </div>

      <div className='flex max-w-6xl mx-auto justify-between items-center mb-5'>
        {/* Manage Users */}
        <ManageUsers/>

        {/* Avatar */}
        <Avatars/>
      </div>
      <hr  className='pb-10'/>

      {/* Collab */}
      <Editor></Editor>
    </div>
  )
}

export default Document
