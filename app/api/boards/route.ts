import {Liveblocks} from "@liveblocks/node";
import {NextRequest} from "next/server";
import { adminDb } from '@/firebase-admin';

export async function PUT(req:NextRequest) {
  const {id, update} = await req.json();
  const liveblocks = new Liveblocks({secret: process.env.LIVEBLOCKS_SECRET_KEY as string});
  console.log({id,update});
  await liveblocks.updateRoom(id, update);
  return Response.json(true);
}

export async function POST(req: NextRequest) {
  const { boardId, url } = await req.json();
  await adminDb.collection('boards').doc(boardId).update({ backgroundImage: url });
  const liveblocks = new Liveblocks({secret: process.env.LIVEBLOCKS_SECRET_KEY as string});
  await liveblocks.updateRoom(boardId, { metadata: { backgroundImage: url } });
  return Response.json({ success: true });
}