'use server';

import BoardsTiles from "@/components/task/BoardsTiles";
import {liveblocksClient} from "@/lib/liveblocksClient";
// import {getUserEmail} from "@/lib/userClient";
import { auth } from "@clerk/nextjs/server";


export default async function Boards() {
  const {sessionClaims} = await auth();

  const email = sessionClaims?.email!;
  const {data:rooms} = await liveblocksClient.getRooms({userId: email});
  return (
    <BoardsTiles boards={rooms} />
  );
}