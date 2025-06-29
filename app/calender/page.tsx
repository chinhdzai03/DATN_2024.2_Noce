import HeaderCal from "@/components/calender/HeaderCal";
import MainView from "@/components/calender/MainView";
import { CalendarEventType } from "@/lib/store";
import dayjs from "dayjs";
import { adminDb } from "@/firebase-admin";
import { auth } from "@clerk/nextjs/server";



const getEventsData = async (userId: string): Promise<CalendarEventType[]> => {
  try {
    const snapshot = await adminDb.collection("users").doc(userId).collection("myEvents").get();

    const events: CalendarEventType[] = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title,
        description: data.description,
        date: dayjs(
          data.date?.toDate ? data.date.toDate() : data.date
        ).toISOString(), // Convert dayjs to ISO string
        role: data.role, // lấy role nếu có
        createdBy: data.createdBy, // lấy createdBy nếu có
        fromTime: data.fromTime, // lấy fromTime nếu có
        toTime: data.toTime,     // lấy toTime nếu có
      };
    });

    return events;
  } catch (error) {
    console.error("Error fetching data from Firestore:", error);
    return [];
  }
};

export default async function Home() {
  const { sessionClaims } = await auth();
  const userId = sessionClaims?.email!;
  const dbEvents = await getEventsData(userId);
  

  return (
    <div className="">
      <HeaderCal />
      <MainView eventsData={dbEvents as CalendarEventType[]} />
    </div>
  );
}
