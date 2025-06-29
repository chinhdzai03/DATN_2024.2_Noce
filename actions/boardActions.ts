'use server';

import {getLiveblocksClient, liveblocksClient} from "@/lib/liveblocksClient";
import {Liveblocks, RoomInfo} from "@liveblocks/node";
import { auth } from "@clerk/nextjs/server";
import { adminDb } from "@/firebase-admin";



export async function createBoard(name: string) : Promise<false | RoomInfo> {
  
  auth.protect();

  const { sessionClaims } = await auth();
  const email = sessionClaims?.email as string;

  if (!email) return false;

  function generateTaskRoomId() {
    const randomNum = Math.floor(1000 + Math.random() * 9000); 
    return `TaskBoard${randomNum}`;
}
  let roomId = generateTaskRoomId();

  // const roomId = uniqid.time();

  // Tạo board trên Liveblocks
  const room = await liveblocksClient.createRoom(roomId, {
    defaultAccesses: [],
    usersAccesses: {
      [email]: ['room:write'],
    },
    metadata: {
      boardName: name,
    },
  });

  // Lưu board vào Firestore
  await adminDb.collection("boards").doc(roomId).set({
    id: roomId,
    name,
    createdAt: new Date(),
    createdBy: email,
  });

  await adminDb
  .collection("users")
  .doc(email)
  .collection("myBoards")
  .doc(roomId)
  .set({
    boardId: roomId,
    name,
    createdAt: new Date(),
    role: "owner",
    createdBy: email,
  });

  return room;
}

export async function addEmailToBoard(boardId:string, email:string) {
  const room = await liveblocksClient.getRoom(boardId);
  const usersAccesses = room.usersAccesses;
  usersAccesses[email] = ['room:write'];
  // console.log(usersAccesses);
  await liveblocksClient.updateRoom(boardId, {usersAccesses});
  // Thêm vào myBoards của guest
  await adminDb
    .collection("users")
    .doc(email)
    .collection("myBoards")
    .doc(boardId)
    .set({
      boardId,
      name: room.metadata.boardName,
      createdAt: new Date(),
      role: "guest",
      createdBy: room.metadata.createdBy || null,
    });
  return true;
}

export async function updateBoard(boardId:string, updateData:any) {
  const result = await liveblocksClient.updateRoom(boardId, updateData);
  if (updateData?.metadata?.boardName) {
    await adminDb.collection("boards").doc(boardId).update({
      name: updateData.metadata.boardName
    });
    // Cập nhật trong myBoards của owner
    const boardDoc = await adminDb.collection("boards").doc(boardId).get();
    if (boardDoc && boardDoc.exists) {
      const createdBy = boardDoc?.data()?.createdBy;
      if (createdBy) {
        await adminDb
          .collection("users")
          .doc(createdBy)
          .collection("myBoards")
          .doc(boardId)
          .update({
            name: updateData.metadata.boardName
          });
      }
    }
  }
  console.log({result});
  return true;
}

export async function removeEmailFromBoard(boardId:string, email:string) {
  const room = await liveblocksClient.getRoom(boardId);
  const usersAccesses:any = room.usersAccesses;
  usersAccesses[email] = null;
  await liveblocksClient.updateRoom(boardId, {usersAccesses});
  // Xóa khỏi myBoards của guest
  await adminDb
    .collection("users")
    .doc(email)
    .collection("myBoards")
    .doc(boardId)
    .delete();
  return true;
}

export async function deleteBoard(boardId:string) {
  await liveblocksClient.deleteRoom(boardId);
  // Lấy createdBy trước khi xóa
  const boardDoc = await adminDb.collection("boards").doc(boardId).get();
  let createdBy = null;
  if (boardDoc && boardDoc.exists) {
    createdBy = boardDoc?.data()?.createdBy;
  }
  await adminDb.collection("boards").doc(boardId).delete();
  // Xóa trong myBoards của owner
  if (createdBy) {
    await adminDb
      .collection("users")
      .doc(createdBy)
      .collection("myBoards")
      .doc(boardId)
      .delete();
  }
  return true;
}