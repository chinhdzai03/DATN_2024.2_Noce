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
import { storage } from '@/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { createApi } from 'unsplash-js';
import Modal from 'react-modal';
import { Tab } from '@headlessui/react';

const EmojiPicker = dynamic(() => import('emoji-picker-react'), { ssr: false });

const unsplash = createApi({
  accessKey: process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY!,
});

const Document = ({id} : {id : string}) => {
    const [data , loading , error] = useDocumentData(doc(db,"documents",id));
    const [input , setInput] = useState('');
    const [isUpdating,startTransiton] = useTransition();
    const [showEmoji, setShowEmoji] = useState(false);
    const isOwner = useOwner();
    const [bgModalOpen, setBgModalOpen] = useState(false);
    const [unsplashResults, setUnsplashResults] = useState<any[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [tab, setTab] = useState<'link' | 'unsplash'>('link');
    const [linkInput, setLinkInput] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

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

    

    // Hàm lưu link ảnh
    const handleLinkSave = async () => {
        setErrorMsg('');
        if (!linkInput.trim()) return;
        if (!/^https?:\/\//.test(linkInput)) {
            setErrorMsg('Invalid URL');
            return;
        }
        await updateDoc(doc(db, 'documents', id), { backgroundImage: linkInput });
        setBgModalOpen(false);
        setLinkInput('');
    };

    // Hàm remove background
    const handleRemoveBg = async () => {
        await updateDoc(doc(db, 'documents', id), { backgroundImage: '' });
        setBgModalOpen(false);
    };

    // Hàm tìm kiếm Unsplash
    const handleUnsplashSearch = async (query: string) => {
        const res = await unsplash.search.getPhotos({ query, perPage: 12 });
        setUnsplashResults(res.response?.results || []);
    };

    // Hàm chọn ảnh Unsplash
    const handleUnsplashSelect = async (url: string) => {
        await updateDoc(doc(db, 'documents', id), { backgroundImage: url });
        setBgModalOpen(false);
    };

  return (
    <div className='flex-1 h-full p-0 bg-white'>
      {/* Banner background */}
      <div className='relative w-full max-w-6xl mx-auto'>
        {data?.backgroundImage && (
          <div
            className='w-full h-[220px] rounded-b-sm bg-gray-200 overflow-hidden'
            style={{
              backgroundImage: `url(${data.backgroundImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              transition: 'background-image 0.3s',
            }}
          >
            {/* Change background button */}
            <button
              className='absolute top-4 right-4 bg-white/80 hover:bg-white text-gray-800 px-4 py-2 rounded shadow font-medium z-10 border border-gray-200'
              onClick={() => setBgModalOpen(true)}
            >
              Change background
            </button>
          </div>
        )}
      </div>
      {/* Modal chọn background */}
      <Modal
        isOpen={bgModalOpen}
        onRequestClose={() => setBgModalOpen(false)}
        contentLabel='Change background'
        ariaHideApp={false}
        style={{ content: { maxWidth: 480, margin: 'auto', height: 420, borderRadius: 16, padding: 0 } }}
      >
        <div className='flex flex-col h-full'>
          <div className='flex border-b'>
            <button className={`flex-1 py-2 ${tab==='link'?'font-bold border-b-2 border-black':'text-gray-500'}`} onClick={()=>setTab('link')}>Link</button>
            <button className={`flex-1 py-2 ${tab==='unsplash'?'font-bold border-b-2 border-black':'text-gray-500'}`} onClick={()=>setTab('unsplash')}>Unsplash</button>
          </div>
          <div className='flex-1 p-4'>
            {tab==='link' && (
              <div className='flex flex-col gap-3'>
                <input type='text' className='border p-2 rounded' placeholder='Paste image URL...' value={linkInput} onChange={e=>setLinkInput(e.target.value)} />
                <button className='bg-blue-600 text-white px-3 py-1 rounded' onClick={handleLinkSave}>Save</button>
                {errorMsg && <div className='text-red-500'>{errorMsg}</div>}
              </div>
            )}
            {tab==='unsplash' && (
              <div className='flex flex-col gap-3'>
                <input type='text' className='border p-2 rounded mb-2' placeholder='Search Unsplash...' onKeyDown={e=>{if(e.key==='Enter') handleUnsplashSearch((e.target as HTMLInputElement).value)}} />
                <div className='grid grid-cols-3 gap-2 max-h-40 overflow-y-auto'>
                  {unsplashResults.map(img=>(
                    <img key={img.id} src={img.urls.thumb} alt={img.alt_description} className='w-full h-20 object-cover rounded cursor-pointer hover:opacity-80' onClick={()=>handleUnsplashSelect(img.urls.full)} />
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className='flex justify-between items-center border-t p-2'>
            <button className='text-red-500 px-4 py-1 rounded-xl border border-red-300 hover:bg-red-500 hover:text-white transition-all duration-300' onClick={handleRemoveBg} disabled={!data?.backgroundImage}>Remove</button>
            <button className='px-4 py-1 rounded-xl bg-gray-200 transition-all duration-300 hover:bg-black hover:text-white' onClick={()=>setBgModalOpen(false)}>Close</button>
          </div>
        </div>
      </Modal>
      <div className='flex max-w-6xl mx-auto justify-between pb-5 mt-4'>
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
          {!data?.backgroundImage&&(
            <button
            className='bg-[#18181B] min-w-fit text-white px-4 py-2 rounded-xl shadow font-medium border border-gray-200 hover:bg-gray-800 transition-all duration-300'
            onClick={() => setBgModalOpen(true)}
          >
            Set Background
          </button>
          )}
          <Button disabled={isUpdating} type='submit'>
            {isUpdating ? "Updating..." : "Update"}
          </Button>
          {isOwner && (
            <>
              <InviteUser />
              <DeleteDocument />
            </>
          )}
        </form>
      </div>
      <div className='flex max-w-6xl mx-auto justify-between items-center mb-5'>
        <ManageUsers />
        <Avatars />
      </div>
      <hr className='pb-10' />
      <Editor></Editor>
    </div>
  )
}

export default Document
