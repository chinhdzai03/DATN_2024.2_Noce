'use server';

import Board from "@/components/task/Board";
import {liveblocksClient} from "@/lib/liveblocksClient";
// import {getUserEmail} from "@/lib/userClient";
import {auth} from "@clerk/nextjs/server";

type PageProps = {
  params: {
    boardId: string;
  };
};

export default async function BoardPage(props: PageProps) {
  const {sessionClaims} = await auth();
  if (!sessionClaims) {
    return 'Access denied';
  }
  const userEmail = sessionClaims?.email!;
  const boardId = props.params.boardId;
  // const userEmail = await getUserEmail();
  const boardInfo = await liveblocksClient.getRoom(boardId);
  const userAccess = boardInfo.usersAccesses?.[userEmail];
  const hasAccess = userAccess && [...userAccess].includes('room:write');
  if (!hasAccess) {
    return (
      <div>Access denied</div>
    );
  }
  return (
    <div>
      <Board
        name={boardInfo.metadata.boardName.toString()}
        id={boardId} />
    </div>
  );
}