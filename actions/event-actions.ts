'use server';

import { adminDb } from "@/firebase-admin";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
dayjs.extend(utc);
dayjs.extend(timezone);

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
  // console.log("time:", time)
  // console.log("date:", date)
  const fromTime = formData.get('fromTime') as string | null;
  const toTime = formData.get('toTime') as string | null;
  const guestsRaw = formData.get('guests') as string;
  const guests = guestsRaw ? guestsRaw.split(/[\,\n;]/).map(e => e.trim()).filter(Boolean) : [];

  if (!title || !description || !date || (!time && (!fromTime || !toTime))) {
    return { error: 'All fields are required' };
  }

  const dateTime = dayjs(`${date}T${time || fromTime}:00`).toDate();
  const eventId = generateEventId();

  console.log("date with utc", dayjs(`${date}T${fromTime}:00`).utc().toDate());
    console.log("date without utc", dayjs(`${date}T${fromTime}:00`).toDate());


  try {
    // Tạo sự kiện trong collection 'events' 
    if(fromTime && toTime){
    await adminDb.collection("events").doc(eventId).set({
      title,
      description,
      date: dayjs(`${date}T${fromTime}:00`).utc().toDate(),
      fromTime: fromTime || time,
      toTime: toTime || time,
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
        date: dayjs(`${date}T${fromTime}:00`).utc().toDate(),
        fromTime: fromTime || time,
        toTime: toTime || time,
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
          date: dayjs(`${date}T${fromTime}:00`).utc().toDate(),
          fromTime: fromTime || time,
          toTime: toTime || time,
          role: "guest",
          invitedBy: userEmail,
          createdBy: userEmail,
          createdAt: new Date(),
        });
    }
    
  }
  // event không có fromTime và toTime
  else{
    await adminDb.collection("events").doc(eventId).set({
      title,
      description,
      date: dayjs(`${date}T${time}:00`).utc().toDate(),
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
        date: dayjs(`${date}T${time}:00`).utc().toDate(),
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
          date: dayjs(`${date}T${time}:00`).utc().toDate(),
          role: "guest",
          invitedBy: userEmail,
          createdBy: userEmail,
          createdAt: new Date(),
        });
    }
  }
  
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
    const fromTime = typeof data.fromTime === 'string' && /^\d{2}:\d{2}$/.test(data.fromTime) ? data.fromTime : undefined;
    const toTime = typeof data.toTime === 'string' && /^\d{2}:\d{2}$/.test(data.toTime) ? data.toTime : undefined;
    return {
      id: doc.id,
      title: data.title,
      description: data.description,
      date: dayjs(data.date.toDate()).tz('Asia/Ho_Chi_Minh'),
      fromTime,
      toTime,
      role: data.role,
      createdBy: data.createdBy,
    };
  });
}

export async function deleteEvent(eventId: string): Promise<{ success: boolean; error?: string }> {
  try {
    auth.protect();
    // console.log("[deleteEvent] eventId:", eventId);

    //  xóa tất cả reference trong myEvents của mọi user trước
    const query = await adminDb.collectionGroup('myEvents').where('eventId', '==', eventId).get();
    
    const batch = adminDb.batch();
    let deleteCount = 0;
    query.docs.forEach((doc) => {
      if (doc.exists) {
        batch.delete(doc.ref);
        deleteCount++;
      }
    });
    
    if (deleteCount > 0) {
      await batch.commit();
    }

    // xóa event khỏi collection 'events'
    await adminDb.collection("events").doc(eventId).delete();

    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting event:", error);
    return { success: false, error: (error as any)?.message || String(error) };
  }
}