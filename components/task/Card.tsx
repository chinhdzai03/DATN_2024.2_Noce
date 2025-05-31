'use client';
import {BoardContext} from "@/components/task/BoardContext";
import PresenceAvatars from "@/components/task/PresenceAvatars";
import Link from "next/link";
import {useParams, useRouter} from "next/navigation";
import {useContext, useEffect, useState} from "react";
import { toast } from "sonner";
import { useMutation } from "@/app/task/liveblocks.config";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";

export default function Card({id, name}: {id:string, name:string}) {
  const params = useParams();
  const router = useRouter();
  const {openCard} = useContext(BoardContext);
  const deleteCard = useMutation(({storage}, id) => {
    const cards = storage.get('cards');
    const cardIndex = cards.findIndex(c => c.toObject().id === id);
    cards.delete(cardIndex);
  }, []);

  useEffect(() => {
    if (params.cardId && !openCard) {
      const {boardId, cardId} = params;
      router.push(`/task/boards/${boardId}`);
      router.push(`/task/boards/${boardId}/cards/${cardId}`);
    }
    if (!params.cardId && openCard) {
      router.push(`/task/boards/${params.boardId}`);
    }
  },[params.cardId]);

  function handleDelete() {
    deleteCard(id);
    toast.success('Card Deleted Successfully!');
  }

  return (
    <div className="relative bg-white my-3 py-3 px-4 rounded-xl shadow transition-all duration-200 text-black font-medium text-base hover:shadow-lg hover:scale-[1.03] block">
      <div className="absolute top-2 right-2 z-10">
        <button
          className="bg-red-500 hover:bg-red-600 text-white rounded-full p-2 shadow flex items-center justify-center w-8 h-8"
          onClick={handleDelete}
          aria-label="Xóa thẻ"
        >
          <FontAwesomeIcon icon={faTrash} size="sm" />
        </button>
      </div>
      <Link
        href={`/task/boards/${params.boardId}/cards/${id}`}
        className="block"
      >
        <span style={{whiteSpace: 'pre-line'}}>{name}</span>
        <div className="absolute bottom-1 right-1">
          <PresenceAvatars presenceKey={'cardId'} presenceValue={id} />
        </div>
      </Link>
    </div>
  );
}