'use server';

import BoardDeleteButton from "@/components/task/BoardDeleteButton";
import EmailsAccessList from "@/components/task/EmailsAccessList";
import NewBoardAccess from "@/components/task/forms/NewBoardAccessForm";
import {liveblocksClient} from "@/lib/liveblocksClient";
// import {getUserEmail} from "@/lib/userClient";
import { auth } from "@clerk/nextjs/server";
import {faArrowLeft} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import Link from "next/link";

type PageProps = {
  params: {
    boardId: string;
  }
}

export default async function BoardSettings({params}:PageProps) {
  const {boardId} = params;
  const boardInfo = await liveblocksClient.getRoom(boardId);
  // console.log(boardInfo)
  const {sessionClaims} = await auth();
  if (!sessionClaims) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="text-6xl mb-4 text-red-500">🚫</div>
        <h2 className="text-2xl font-bold mb-2 text-black">Access Denied</h2>
        <p className="mb-6 text-gray-600">You do not have permission to view this board.</p>
        <a href="/task" className="inline-block bg-black text-white px-6 py-2 rounded-xl shadow hover:bg-gray-900 transition">Back to Your Boards</a>
      </div>
    );
  }
  const userEmail = sessionClaims?.email!;
  // const userEmail = await getUserEmail();
  if (!boardInfo.usersAccesses[userEmail]) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="text-6xl mb-4 text-red-500">🚫</div>
        <h2 className="text-2xl font-bold mb-2 text-black">Access Denied</h2>
        <p className="mb-6 text-gray-600">You do not have permission to view this board.</p>
        <a href="/task" className="inline-block bg-black text-white px-6 py-2 rounded-xl shadow hover:bg-gray-900 transition">Back to Your Boards</a>
      </div>
    );
  }
  return (
    <div className="flex items-center justify-center min-h-[80vh] bg-white">
      <div className="min-w-fit max-w-2xl bg-white rounded-2xl shadow-xl p-10 flex flex-col">
        <div className="flex justify-between items-center mb-6 gap-10">
          <Link className="inline-flex gap-2 items-center bg-black text-white px-4 py-2 rounded-xl shadow hover:bg-gray-900 transition"
                href={`/task/boards/${boardId}`}>
            <FontAwesomeIcon icon={faArrowLeft} />
            Back to Board
          </Link>
          <BoardDeleteButton boardId={boardId} />
        </div>
        <h1 className="text-3xl font-bold text-black mb-6">Board Settings: <span className="font-normal">{boardInfo.metadata.boardName}</span></h1>
        <div className="mb-8">
          <EmailsAccessList
            boardId={boardId}
            usersAccesses={boardInfo.usersAccesses} />
        </div>
        <NewBoardAccess boardId={boardId} />
      </div>
    </div>
  )
}