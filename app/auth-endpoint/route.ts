import { collectionGroup, where } from 'firebase/firestore';
import liveblocks from "@/lib/liveblocks";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { adminDb } from '@/firebase-admin';

export async function POST(request: NextRequest) { 
    //auth().protect();
    auth.protect();

    const {sessionClaims} = await auth();
    const {room} = await request.json();

    const session = liveblocks.prepareSession(sessionClaims?.email! , {
        userInfo: {
            name : sessionClaims?.fullName!,
            email : sessionClaims?.email!,
            avatar : sessionClaims?.image!
        }
    });

    const userInRoom = await adminDb.collectionGroup('rooms').where('userId' , '==', sessionClaims?.email!).get();

    const userInRooms = userInRoom.docs.find(doc => doc.id === room);

    if(userInRooms?.exists) {
        session.allow(room , session.FULL_ACCESS);
        const { body , status } = await session.authorize();

        console.log("you are authorized")

        return new Response(body , { status });

    }
    else{
        return NextResponse.json (
                { message : "You are not in this room"},
                { status : 403 }
        )
    }

}