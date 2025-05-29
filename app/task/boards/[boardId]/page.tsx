'use server';

import Board from "@/components/task/Board";
import {liveblocksClient} from "@/lib/liveblocksClient";
// import {getUserEmail} from "@/lib/userClient";
import {auth} from "@clerk/nextjs/server";
import { adminDb } from '@/firebase-admin';

type PageProps = {
  params: {
    boardId: string;
  };
};

export default async function BoardPage(props: PageProps) {
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
  const boardId = props.params.boardId;
  // const userEmail = await getUserEmail();
  const boardInfo = await liveblocksClient.getRoom(boardId);
  const userAccess = boardInfo.usersAccesses?.[userEmail];
  const hasAccess = userAccess && [...userAccess].includes('room:write');
  if (!hasAccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="text-6xl mb-4 text-red-500">🚫</div>
        <h2 className="text-2xl font-bold mb-2 text-black">Access Denied</h2>
        <p className="mb-6 text-gray-600">You do not have permission to view this board.</p>
        <a href="/task" className="inline-block bg-black text-white px-6 py-2 rounded-xl shadow hover:bg-gray-900 transition">Back to Your Boards</a>
      </div>
    );
  }
  // Lấy backgroundImage từ Firestore
  const boardDoc = await adminDb.collection('boards').doc(boardId).get();
  const backgroundImage = boardDoc.exists ? boardDoc.data()?.backgroundImage : undefined;
  return (
    <div>
      <Board
        name={boardInfo.metadata.boardName.toString()}
        id={boardId}
        backgroundImage={boardInfo.metadata.backgroundImage as string}
      />
    </div>
  );
}