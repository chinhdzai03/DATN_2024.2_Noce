'use client';
import {updateBoard} from "@/actions/boardActions";
import {RoomProvider, useMyPresence, useUpdateMyPresence} from "@/app/task/liveblocks.config";
import {BoardContextProvider} from "@/components/task/BoardContext";
import Columns from "@/components/task/Columns";
import {faCog, faArrowLeft} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {LiveList} from "@liveblocks/core";
import {ClientSideSuspense} from "@liveblocks/react";
import Link from "next/link";
import {useRouter} from "next/navigation";
import {FormEvent, useEffect, useState} from "react";
import Modal from 'react-modal';
import { createApi } from 'unsplash-js';
import { adminDb } from '@/firebase-admin';

const unsplash = createApi({
  accessKey: process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY!,
});

export default function Board({id, name, backgroundImage}: {id:string, name:string, backgroundImage?:string}) {
  const [renameMode, setRenameMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();
  const updateMyPresence = useUpdateMyPresence();
  const [bgModalOpen, setBgModalOpen] = useState(false);
  const [tab, setTab] = useState<'link' | 'unsplash'>('link');
  const [linkInput, setLinkInput] = useState('');
  const [unsplashResults, setUnsplashResults] = useState<any[]>([]);
  const [errorMsg, setErrorMsg] = useState('');
  const [isUpdatingBg, setIsUpdatingBg] = useState(false);

  useEffect(() => {
    updateMyPresence({boardId: id});

    return () => {
      updateMyPresence({boardId:null});
    }
  }, []);

  async function handleNameSubmit(ev:FormEvent) {
    ev.preventDefault();
    const input = (ev.target as HTMLFormElement).querySelector('input');
    if (input) {
      const newName = input.value;
      await updateBoard(id, {metadata: {boardName: newName}});
      input.value = '';
      setRenameMode(false);
      router.refresh();
    }
  }

  // Hàm lưu background vào Firestore
  const handleSetBackground = async (url: string) => {
    setIsUpdatingBg(true);
    setErrorMsg('');
    try {
      // @ts-ignore
      await window.fetch('/api/boards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ boardId: id, url }),
      });
      setBgModalOpen(false);
      router.refresh();
    } catch (err) {
      setErrorMsg('Failed to update background');
    } finally {
      setIsUpdatingBg(false);
    }
  };

  // Hàm lưu link ảnh
  const handleLinkSave = async () => {
    if (!linkInput.trim()) return;
    if (!/^https?:\/\//.test(linkInput)) {
      setErrorMsg('Invalid URL');
      return;
    }
    await handleSetBackground(linkInput);
    setLinkInput('');
  };

  // Hàm tìm kiếm Unsplash
  const handleUnsplashSearch = async (query: string) => {
    const res = await unsplash.search.getPhotos({ query, perPage: 12 });
    setUnsplashResults(res.response?.results || []);
  };

  // Hàm chọn ảnh Unsplash
  const handleUnsplashSelect = async (url: string) => {
    await handleSetBackground(url);
  };

  // Hàm remove background
  const handleRemoveBg = async () => {
    await handleSetBackground('');
  };

  return (
    <BoardContextProvider>
      <div
        className="relative min-h-screen w-full"
        style={backgroundImage ? {
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          transition: 'background-image 0.3s',
        } : {}}
      >
        {/* Nút Change/Set background nổi góc phải */}
        <button
          className={`bg-black absolute right-8 top-[84px] rounded-xl text-white px-4 py-2 shadow font-medium z-20 border border-gray-200 hover:bg-gray-800 transition-all duration-300${backgroundImage ? '' : ' mt-4'}`}
          onClick={() => setBgModalOpen(true)}
        >
          {backgroundImage ? 'Change Background' : 'Set Background'}
        </button>
        {/* Modal chọn background */}
        <Modal
          isOpen={bgModalOpen}
          onRequestClose={() => setBgModalOpen(false)}
          contentLabel='Change background'
          ariaHideApp={false}
          style={{ content: { maxWidth: 480, margin: 'auto', height: 420, borderRadius: 16, padding: 0 },
          overlay: { zIndex: 10000, background: 'rgba(0,0,0,0.3)' } }}
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
                  <button className='bg-blue-600 text-white px-3 py-1 rounded' onClick={handleLinkSave} disabled={isUpdatingBg}>Save</button>
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
              <button className='text-red-500 px-4 py-1 rounded-xl border border-red-300 hover:bg-red-500 hover:text-white transition-all duration-300' onClick={handleRemoveBg} disabled={!backgroundImage}>Remove</button>
              <button className='px-4 py-1 rounded-xl bg-gray-200 transition-all duration-300 hover:bg-black hover:text-white' onClick={()=>setBgModalOpen(false)}>Close</button>
            </div>
          </div>
        </Modal>
        {/* Nội dung board */}
        <div className="relative z-10">
          <div className="flex gap-4 justify-between items-center mb-4 bg-white rounded-b-2xl p-5 shadow-md">
            <div className="flex items-center gap-4 flex-1">
              {!renameMode && (
                <h1
                  className="text-3xl font-bold text-black cursor-pointer ml-4"
                  onClick={() => setRenameMode(true)}>
                  Board: {name}
                </h1>
              )}
              {renameMode && (
                <form onSubmit={handleNameSubmit}>
                  <input type="text" defaultValue={name} className="text-xl px-2 py-1 focus:outline-none bg-white text-black rounded"/>
                </form>
              )}
            </div>
            <input
                type="text"
                placeholder="Search cards..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:border-black w-full max-w-xs"
              />
            <Link
              className="flex gap-2 items-center rounded-xl px-4 py-2 text-black hover:bg-gray-100 transition"
              href={`/task/boards/${id}/settings`}>
              <FontAwesomeIcon icon={faCog} className="text-black" />
              Board settings
            </Link>
          </div>
          <Link
            href="/task"
            className="inline-flex gap-2 items-center bg-black text-white px-4 py-2 rounded-xl shadow hover:bg-gray-900 transition w-fit mb-4 ml-4"
          >
            <FontAwesomeIcon icon={faArrowLeft} />
            Back to Your Boards
          </Link>
          <Columns searchTerm={searchTerm} />
        </div>
      </div>
    </BoardContextProvider>
  );
}