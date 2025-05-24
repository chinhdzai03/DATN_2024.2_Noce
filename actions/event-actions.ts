// 'use server'

// import { db } from "@/db/drizzle";
// import { eventsTable } from "@/db/schema";
// import { revalidatePath } from "next/cache";


// export async function createEvent(formData:  FormData): Promise<{ error: string } | { success: boolean } > {
//   const title = formData.get('title') as string;
//   const description = formData.get('description') as string;
//   const date = formData.get('date') as string;
//   const time = formData.get('time') as string;


//   if (!title || !description || !date || !time) {
//     return { error: 'All fields are required' };
//   }

//   const dateTime = new Date(`${date}T${time}:00`);

//   try {
//     await db.insert(eventsTable).values({
//         title,
//         description,
//         date: dateTime,
//       });

//       // Revalidate the path and return a success response  
//     revalidatePath("/");

//     return { success: true };  // Return success instead of revalidatePath directly
    
//   } catch (error) {
//     console.error('Error creating event:', error);
//     return { error: 'Failed to create event' };
//   }
// }

'use server';

import { adminDb } from "@/firebase-admin";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import dayjs from "dayjs";

function generateEventId() {
  const randomNum = Math.floor(1000 + Math.random() * 9000); // 4 số ngẫu nhiên
  return `CalendarEvent${randomNum}`;
}

export async function createEvent(formData: FormData): Promise<{ error: string } | { success: boolean }> {
  auth.protect();

  // Lấy thông tin người dùng
  const { sessionClaims } = await auth();
  const userEmail = sessionClaims?.email;

  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const date = formData.get('date') as string;
  const time = formData.get('time') as string;
  const guestsRaw = formData.get('guests') as string;
  const guests = guestsRaw ? guestsRaw.split(/[\,\n;]/).map(e => e.trim()).filter(Boolean) : [];

  if (!title || !description || !date || !time) {
    return { error: 'All fields are required' };
  }

  const dateTime = new Date(`${date}T${time}:00`);
  const eventId = generateEventId();

  try {
    // Tạo sự kiện trong collection 'events' với eventId tự tạo
    await adminDb.collection("events").doc(eventId).set({
      title,
      description,
      date: dateTime,
      createdBy: userEmail,
      createdAt: new Date(),
    });

    // Ghi thông tin sự kiện vào user subcollection 'myEvents'
    await adminDb
      .collection("users")
      .doc(userEmail!)
      .collection("myEvents")
      .doc(eventId)
      .set({
        eventId: eventId,
        title,
        description,
        date: dateTime,
        role: "owner",
        createdBy: userEmail,
        createdAt: new Date(),
      });

    // Lưu event cho từng guest
    for (const guestEmail of guests) {
      await adminDb
        .collection("users")
        .doc(guestEmail)
        .collection("myEvents")
        .doc(eventId)
        .set({
          eventId: eventId,
          title,
          description,
          date: dateTime,
          role: "guest",
          invitedBy: userEmail,
          createdBy: userEmail,
          createdAt: new Date(),
        });
    }

    // Làm mới cache path (nếu cần)
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    console.error("Error creating event:", error);
    return { error: "Failed to create event: " + ((error as any)?.message || String(error)) };
  }
}

export async function getEvents() {
  auth.protect();
  const { sessionClaims } = await auth();

  const userEmail = sessionClaims?.email;
  if (!userEmail) return [];

  const snapshot = await adminDb
    .collection("users")
    .doc(userEmail)
    .collection("myEvents")
    .get();

  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      title: data.title,
      description: data.description,
      date: dayjs(data.date.toDate()), // convert Firestore Timestamp to dayjs
    };
  });
}

export async function deleteEvent(eventId: string): Promise<{ success: boolean; error?: string }> {
  try {
    auth.protect();
    // console.log("[deleteEvent] eventId:", eventId);

    // Tìm và xóa tất cả reference trong myEvents của mọi user trước
    const query = await adminDb.collectionGroup('myEvents').where('eventId', '==', eventId).get();
    // console.log('[deleteEvent] myEvents found:', query.docs.length);
    const batch = adminDb.batch();
    let deleteCount = 0;
    query.docs.forEach((doc) => {
      if (doc.exists) {
        batch.delete(doc.ref);
        deleteCount++;
      }
    });
    // console.log('[deleteEvent] myEvents to delete:', deleteCount);
    if (deleteCount > 0) {
      await batch.commit();
    }

    // Sau đó xóa event khỏi collection 'events'
    await adminDb.collection("events").doc(eventId).delete();

    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting event:", error);
    return { success: false, error: (error as any)?.message || String(error) };
  }
}