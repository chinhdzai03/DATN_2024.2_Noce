'use server';
import { adminDb } from "@/firebase-admin";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { Timestamp } from "firebase-admin/firestore"; 
dayjs.extend(utc);
dayjs.extend(timezone);

function generateEventId() {
  const randomNum = Math.floor(1000 + Math.random() * 9000); 
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
  const reply = formData.get('reply') as string;
  console.log("reply:",reply)

  if (!title || !description || !date || (!time && (!fromTime || !toTime))) {
    return { error: 'All fields are required' };
  }
  // console.log("date and time:", date, time)

  // const datetimeStr = `${date}T${fromTime}:00`;
  // if (!dayjs(datetimeStr).isValid()) {
  //   throw new Error("Invalid datetime string");
  // }
  // const dateTime = dayjs.tz(datetimeStr, 'Asia/Ho_Chi_Minh').toDate()
  const dateTime = dayjs(`${date}T${fromTime || time}:00`).toDate();
  const eventId = generateEventId();

  
  let recurrence = null;
  if (reply !== "day") {
    let until;
    switch (reply) {
      case "week":
        until = dayjs(dateTime).add(1, "week").subtract(1, "day").toDate();
        break;
      case "month":
        until = dayjs(dateTime).add(1, "month").subtract(1, "day").toDate();
        break;
      case "year":
        until = dayjs(dateTime).add(1, "year").subtract(1, "day").toDate();
        break;
    }

    recurrence = {
      frequency: "daily", // Lặp mỗi ngày
      interval: 1,
      until: Timestamp.fromDate(until!),
    };
  }
  try {
    // Tạo sự kiện trong collection 'events' 
    if(fromTime && toTime){
    await adminDb.collection("events").doc(eventId).set({
      title,
      description,
      date: dayjs.tz(`${date}T${fromTime}:00`, 'Asia/Ho_Chi_Minh').toDate(),
      // date: dayjs(`${date}T${time}:00`).toDate(),
      fromTime: fromTime || time,
      toTime: toTime || time,
      createdBy: userEmail,
      createdAt: new Date(),
      recurrence,
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
        date: dayjs.tz(`${date}T${fromTime}:00`, 'Asia/Ho_Chi_Minh').toDate(),
        fromTime: fromTime || time,
        toTime: toTime || time,
        role: "owner",
        createdBy: userEmail,
        createdAt: new Date(),
        recurrence,
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
          date: dayjs.tz(`${date}T${fromTime}:00`, 'Asia/Ho_Chi_Minh').toDate(),
          fromTime: fromTime || time,
          toTime: toTime || time,
          role: "guest",
          invitedBy: userEmail,
          createdBy: userEmail,
          createdAt: new Date(),
          recurrence,
        });
    }
    
  }
  // event không có fromTime và toTime
  else{
    await adminDb.collection("events").doc(eventId).set({
      title,
      description,
      date: dayjs.tz(`${date}T${time}:00`, 'Asia/Ho_Chi_Minh').toDate(),
      fromTime: time,
      createdBy: userEmail,
      createdAt: new Date(),
      recurrence,
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
        date: dayjs.tz(`${date}T${time}:00`, 'Asia/Ho_Chi_Minh').toDate(),
        // date: dayjs(`${date}T${time}:00`).toDate(),
        fromTime: time,
        role: "owner",
        createdBy: userEmail,
        createdAt: new Date(),
        recurrence,
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
          date: dayjs.tz(`${date}T${time}:00`, 'Asia/Ho_Chi_Minh').toDate(),
          fromTime: time,
          role: "guest",
          invitedBy: userEmail,
          createdBy: userEmail,
          createdAt: new Date(),
          recurrence,
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

export async function deleteEventOne(eventId: string, occurrenceDateISO: string): Promise<{ success: boolean; error?: string }> {
  try {
    auth.protect();

    const eventRef = adminDb.collection("events").doc(eventId);
    const eventSnap = await eventRef.get();

    if (!eventSnap.exists) {
      return { success: false, error: "Event not found" };
    }

    const eventData = eventSnap.data();
    const excludedDates = eventData?.excludedDates || [];

    // Thêm ngày mới vào danh sách loại trừ
    const updatedExcludedDates = [...excludedDates, new Date(occurrenceDateISO)];

    await eventRef.update({
      excludedDates: updatedExcludedDates
    });

    // Cập nhật tất cả `myEvents` của user có liên quan
    const query = await adminDb.collectionGroup("myEvents").where("eventId", "==", eventId).get();
    const batch = adminDb.batch();

    for (const doc of query.docs) {
      batch.update(doc.ref, {
        excludedDates: updatedExcludedDates
      });
    }

    await batch.commit();

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Error deleting event occurrence:", error);
    return { success: false, error: String(error) };
  }
}

