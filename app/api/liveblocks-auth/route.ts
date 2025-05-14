// import { Image } from 'next/image';
// import {authOptions} from "@/lib/authOptions";
import {liveblocksClient} from "@/lib/liveblocksClient";
import { auth } from "@clerk/nextjs/server";
// import {getServerSession} from "next-auth";

export async function POST(request: Request) {
  // Get the current user from your database
  // const session = await getServerSession(authOptions);
    const {sessionClaims} = await auth();

  if (!sessionClaims ) {
    return new Response('Unauthorized', { status: 401 });
  }

  const user = sessionClaims?.fullName;
  const email = sessionClaims?.email || '';

  // Identify the user and return the result
  const { status, body } = await liveblocksClient.identifyUser(
    {
      userId: email,
      groupIds: [],
    },
    {
      userInfo: {
        name : sessionClaims?.fullName!,
        email : sessionClaims?.email!,
        avatar : sessionClaims?.image!,
      },
    },
  );

  return new Response(body, { status });
}
