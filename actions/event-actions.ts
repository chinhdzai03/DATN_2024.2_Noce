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


export async function createEvent(formData: FormData): Promise<{ error: string } | { success: boolean }> {
  auth.protect();

  // Lấy thông tin người dùng
  const { sessionClaims } = await auth();
  const userEmail = sessionClaims?.email;

  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const date = formData.get('date') as string;
  const time = formData.get('time') as string;

  if (!title || !description || !date || !time) {
    return { error: 'All fields are required' };
  }

  const dateTime = new Date(`${date}T${time}:00`);

  try {
    // Tạo sự kiện trong collection 'events'
    const eventRef = await adminDb.collection("events").add({
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
      .doc(eventRef.id)
      .set({
        eventId: eventRef.id,
        title,
        date: dateTime,
        role: "owner",
        createdAt: new Date(),
      });

    // Làm mới cache path (nếu cần)
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    console.error("Error creating event:", error);
    return { error: "Failed to create event" };
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