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
  const {sessionClaims} = await auth();
  if (!sessionClaims) {
    return 'Access denied';
  }
  const userEmail = sessionClaims?.email!;
  // const userEmail = await getUserEmail();
  if (!boardInfo.usersAccesses[userEmail]) {
    return 'Access denied';
  }
  return (
    <div>
      <div className="flex justify-between">
        <Link className="inline-flex gap-1 items-center btn mb-4"
              href={`/task/boards/${boardId}`}>
          <FontAwesomeIcon icon={faArrowLeft} />
          Go back to board
        </Link>
        <BoardDeleteButton boardId={boardId} />
      </div>

      <h1 className="text-2xl">Access to board {boardInfo.metadata.boardName}:</h1>
      <div className="mb-8">
        <EmailsAccessList
          boardId={boardId}
          usersAccesses={boardInfo.usersAccesses} />
      </div>
      <NewBoardAccess boardId={boardId} />
    </div>
  )
}