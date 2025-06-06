import {liveblocksClient} from "@/lib/liveblocksClient";
import { auth } from "@clerk/nextjs/server";

export async function POST(request: Request) {
  const {sessionClaims} = await auth();
  if (!sessionClaims ) {
    return new Response('Unauthorized', { status: 401 });
  }

  const email = sessionClaims?.email || '';
  const { room } = await request.json();
  if (!room) {
    return new Response('Missing room id', { status: 400 });
  }

  const session = liveblocksClient.prepareSession(email, {
    userInfo: {
      name : sessionClaims?.fullName,
      email : sessionClaims?.email,
      avatar : sessionClaims?.image,
    },
  });
  session.allow(room, session.FULL_ACCESS);
  const { body, status } = await session.authorize();
  return new Response(body, { status });
}

