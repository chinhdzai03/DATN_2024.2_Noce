'use server';

import { adminDb } from "@/firebase-admin";
import liveblocks from "@/lib/liveblocks";
import { auth } from "@clerk/nextjs/server";


export async function createNewDocument() {
    auth.protect();
    const {sessionClaims} = await auth();

    // Tạo roomID theo format DocRoomXXXX với 4 số ngẫu nhiên
    function generateRoomId() {
        const randomNum = Math.floor(1000 + Math.random() * 9000); // 4 số ngẫu nhiên
        return `DocRoom${randomNum}`;
    }
    let roomId = generateRoomId();
    // Đảm bảo roomId là duy nhất (có thể kiểm tra trùng lặp nếu cần)

    // Tạo document với roomId custom
    await adminDb.collection("documents").doc(roomId).set({
        title : "New Doc",
        icon: "📄"
    });
    await adminDb.collection('users').doc(sessionClaims?.email!).collection('rooms').doc(roomId).set({
        userId : sessionClaims?.email! , 
        role : "owner",
        createAt : new Date(),
        roomId : roomId
    });
    return {docId : roomId};
}

export async function deleteDocument( roomId : string) { 
    auth.protect();

    console.log("deleteDocument", roomId); 

    try {
        // delete the document reference itself
        await adminDb.collection('documents').doc(roomId).delete();
    
        const query = await adminDb.collectionGroup('rooms').where('roomId' , '==', roomId).get();
    
        const batch = adminDb.batch();
        // Delete the room references in the user's collection for every user in the room
        query.docs.forEach((doc) => {
            batch.delete(doc.ref);
        });
    
        await batch.commit();
    
        await liveblocks.deleteRoom(roomId);
    
        return {success : true};
    } catch (error) {
        console.error(error);
        return {success : false}
    }
}

export async function InviteUserToDocument( roomId : string , email : string) {
    auth.protect();
    console.log("InviteUserToDocument", roomId, email);
    try {
        await adminDb.collection('users').doc(email).collection('rooms').doc(roomId).set({
            userId : email , 
            role : "editor",
            createAt : new Date(),
            roomId ,
        });
        return {success : true};
    } catch (error) {
        console.error(error);
        return {success : false}
    }
}

export async function removeUserFromRoom( roomId : string , email : string) {
    auth.protect();
    console.log("removeUserFromRoom", roomId, email);
    try {
        await adminDb.collection('users').doc(email).collection('rooms').doc(roomId).delete();
        return {success : true};
    } catch (error) {
        console.error(error);
        return {success : false}
    }
}