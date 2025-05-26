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

export default function Board({id, name}: {id:string, name:string}) {
  const [renameMode, setRenameMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();
  const updateMyPresence = useUpdateMyPresence();

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

  return (
    <BoardContextProvider>
      <RoomProvider
        id={id}
        initialPresence={{
          cardId:null,
          boardId:null,
        }}
        initialStorage={{
          columns: new LiveList([]),
          cards: new LiveList([]),
        }}>
        <ClientSideSuspense fallback={(<div>loading...</div>)}>{() => (
          <>
            <div className="flex gap-4 justify-between items-center mb-4 bg-white rounded-2xl p-6 shadow-md">
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
          </>
        )}
        </ClientSideSuspense>
      </RoomProvider>
    </BoardContextProvider>
  );
}