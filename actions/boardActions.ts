'use server';

// import {authOptions} from "@/lib/authOptions";
import {getLiveblocksClient, liveblocksClient} from "@/lib/liveblocksClient";
import {Liveblocks, RoomInfo} from "@liveblocks/node";
// import {getServerSession} from "next-auth";
import uniqid from 'uniqid';
import { auth } from "@clerk/nextjs/server";



export async function createBoard(name: string) : Promise<false | RoomInfo> {
  
  auth.protect();

  const { sessionClaims } = await auth();
  const email = sessionClaims?.email as string;

  if (!email) return false;

  function generateTaskRoomId() {
    const randomNum = Math.floor(1000 + Math.random() * 9000); // 4 số ngẫu nhiên
    return `TaskRoom${randomNum}`;
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

  return room;
}

export async function addEmailToBoard(boardId:string, email:string) {
  const room = await liveblocksClient.getRoom(boardId);
  const usersAccesses = room.usersAccesses;
  usersAccesses[email] = ['room:write'];
  console.log(usersAccesses);
  await liveblocksClient.updateRoom(boardId, {usersAccesses});
  return true;
}

export async function updateBoard(boardId:string, updateData:any) {
  const result = await liveblocksClient.updateRoom(boardId, updateData);
  console.log({result});
  return true;
}

export async function removeEmailFromBoard(boardId:string, email:string) {
  const room = await liveblocksClient.getRoom(boardId);
  const usersAccesses:any = room.usersAccesses;
  usersAccesses[email] = null;
  await liveblocksClient.updateRoom(boardId, {usersAccesses});
  return true;
}

export async function deleteBoard(boardId:string) {
  await liveblocksClient.deleteRoom(boardId);
  return true;
}