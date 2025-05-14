'use client';
import {deleteBoard} from "@/actions/boardActions";
import {useRouter} from "next/navigation";

export default function BoardDeleteButton({boardId}:{boardId:string}) {
  const router = useRouter();
  async function handleDeleteBoard() {
    await deleteBoard(boardId);
    router.push('/task');
  }
  return (
    <div>
      <button
        className="bg-red-500 text-white px-4 py-2 rounded-md"
        onClick={() => handleDeleteBoard()}>Delete board
      </button>
    </div>
  );
}