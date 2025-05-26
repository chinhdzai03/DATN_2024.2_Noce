'use client';
import {BoardContext} from "@/components/task/BoardContext";
import PresenceAvatars from "@/components/task/PresenceAvatars";
import Link from "next/link";
import {useParams, useRouter} from "next/navigation";
import {useContext, useEffect} from "react";

export default function Card({id, name}: {id:string, name:string}) {
  const params = useParams();
  const router = useRouter();
  const {openCard} = useContext(BoardContext);

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

  return (
    <Link
      href={`/task/boards/${params.boardId}/cards/${id}`}
      className="relative bg-white my-3 py-3 px-4 rounded-xl shadow transition-all duration-200 text-black font-medium text-base hover:shadow-lg hover:scale-[1.03] block"
    >
      <span style={{whiteSpace: 'pre-line'}}>{name}</span>
      <div className="absolute bottom-1 right-1">
        <PresenceAvatars presenceKey={'cardId'} presenceValue={id} />
      </div>
    </Link>
  );
}