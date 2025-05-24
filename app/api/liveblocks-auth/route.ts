
import {liveblocksClient} from "@/lib/liveblocksClient";
import { auth } from "@clerk/nextjs/server";


export async function POST(request: Request) {
  // Get the current user from your database
  // const session = await getServerSession(authOptions);
    const {sessionClaims} = await auth();

  if (!sessionClaims ) {
    return new Response('Unauthorized', { status: 401 });
  }

  const email = sessionClaims?.email || '';

  // Identify the user and return the result
  const { status, body } = await liveblocksClient.identifyUser(
    {
      userId: email,
      groupIds: [],
    },
    {
      userInfo: {
        name : sessionClaims?.fullName,
        email : sessionClaims?.email,
        avatar : sessionClaims?.image,
      },
    },
  );

  // const session = liveblocksClient.prepareSession(email, {
  //   userInfo: {
  //     name : sessionClaims?.fullName,
  //     email : sessionClaims?.email,
  //     avatar : sessionClaims?.image,
  //   },
  // });

  // const { body, status } = await session.authorize();

  return new Response(body, { status });
}
