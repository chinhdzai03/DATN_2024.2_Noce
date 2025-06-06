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
import { Checkbox } from "@/components/ui/checkbox";

export default function Card({id, name}: {id:string, name:string}) {
  const params = useParams();
  const router = useRouter();
  const {openCard} = useContext(BoardContext);
  const [completed, setCompleted] = useState(false);

  const getCompleted = useMutation(({storage}, id) => {
    const cards = storage.get('cards');
    const cardIndex = cards.findIndex(c => c.toObject().id === id);
    if (cardIndex !== -1) {
      return cards.get(cardIndex)?.toObject()?.completed ?? false; 
    }
    return false;
  }, []);

  const updateCompleted = useMutation(({storage}, id, value) => {
    const cards = storage.get('cards');
    const cardIndex = cards.findIndex(c => c.toObject().id === id);
    if (cardIndex !== -1) {
      cards.get(cardIndex)?.set('completed', value);
    }
  }, []);

  useEffect(() => {
    setCompleted(getCompleted?.(id) ?? false);
  }, [id, getCompleted]);

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
    deleteCard?.(id);
    toast.success('Card Deleted Successfully!');
  }

  return (
    <div className="relative bg-white my-3 py-3 px-4 rounded-xl shadow transition-all duration-200 text-black font-medium text-base hover:shadow-lg hover:scale-[1.03] block">
      <div className="absolute top-2 left-2 z-10">
        <Checkbox
          checked={completed}
          onCheckedChange={checked => {
            setCompleted(!!checked);
            updateCompleted(id, !!checked);
          }}
          className={`w-6 h-6 rounded-full border-2 ${completed ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-300'} flex items-center justify-center transition-colors`}
        />
      </div>
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
        <div style={{paddingLeft: 32}}>
          <span
            style={{
              whiteSpace: 'pre-line',
              textDecoration: completed ? 'line-through' : 'none',
              color: completed ? '#2563eb' : undefined
            }}
          >
            {name}
          </span>
        </div>
        <div className="absolute bottom-2 right-12">
          <PresenceAvatars presenceKey={'cardId'} presenceValue={id} />
        </div>
      </Link>
    </div>
  );
}