'use client';
import {RoomProvider, } from "@/app/task/liveblocks.config";
import PresenceAvatars from "@/components/task/PresenceAvatars";
import { LiveList } from "@liveblocks/client";
import {RoomInfo} from "@liveblocks/node";
import Link from "next/link";

export default function BoardsTiles({boards}:{boards:RoomInfo[]}) {

  return (
    <>
        <div className="my-8 grid md:grid-cols-3 lg:grid-cols-4 gap-6">
          {boards?.length > 0 && boards.map(board => (
            <Link
              className="px-8 py-12 rounded-2xl block relative shadow-lg text-black font-bold text-xl transition-all duration-200 hover:shadow-xl hover:scale-105"
              href={`/task/boards/${board.id}`}
              key={board.id}
              style={board.metadata.backgroundImage ? {
                backgroundImage: `url(${board.metadata.backgroundImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                transition: 'background-image 0.3s',
              } : { backgroundColor: '#FFFBDE' }}
            >
              <div className="px-4 py-2 bg-white rounded-2xl w-fit shadow-sm">{board.metadata.boardName}</div>
              <RoomProvider 
                id={board.id} initialPresence={{}} 
                initialStorage={{
                      columns: new LiveList([]),
                      cards: new LiveList([]),
               }}> 
                <div className="absolute bottom-1 right-1">
                  <PresenceAvatars presenceKey={'boardId'} presenceValue={board.id}/>
                </div>
              </RoomProvider>
            </Link>
          ))}
        </div>
    </>
  );
}