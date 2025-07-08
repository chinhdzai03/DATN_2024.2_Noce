import HeaderCal from "@/components/calender/HeaderCal";
import MainView from "@/components/calender/MainView";
import { CalendarEventType } from "@/lib/store";
import dayjs from "dayjs";
import { adminDb } from "@/firebase-admin";
import { auth } from "@clerk/nextjs/server";

import { RRule, RRuleSet  } from "rrule";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
dayjs.extend(utc);
dayjs.extend(timezone);

// const getEventsData = async (userId: string): Promise<CalendarEventType[]> => {
//   try {
//     const snapshot = await adminDb.collection("users").doc(userId).collection("myEvents").get();

//     const events: CalendarEventType[] = snapshot.docs.map((doc) => {
//       const data = doc.data();
//       return {
//         id: doc.id,
//         title: data.title,
//         description: data.description,
//         date: dayjs(
//           data.date?.toDate ? data.date.toDate() : data.date
//         ).toISOString(), // Convert dayjs to ISO string
//         role: data.role, // lấy role nếu có
//         createdBy: data.createdBy, // lấy createdBy nếu có
//         fromTime: data.fromTime, // lấy fromTime nếu có
//         toTime: data.toTime,     // lấy toTime nếu có
//       };
//     });

//     return events;
//   } catch (error) {
//     console.error("Error fetching data from Firestore:", error);
//     return [];
//   }
// };

 const getEventsData = async (userId: string): Promise<CalendarEventType[]> => {
  try {
    const snapshot = await adminDb
      .collection("users")
      .doc(userId)
      .collection("myEvents")
      .get();

    const events: CalendarEventType[] = [];

    for (const doc of snapshot.docs) {
      const data = doc.data();

      const baseEvent = {
        id: doc.id,
        title: data.title,
        description: data.description,
        fromTime: data.fromTime ,
        toTime: data.toTime,
        role: data.role,
        createdBy: data.createdBy,
        reply: data.recurrence == null ? false : true, // Thêm trường reply nếu có lặp lại
      };

      const baseDate = data.date?.toDate ? data.date.toDate() : data.date;

      // Trường hợp sự kiện có lặp lại
      if (data.recurrence && data.recurrence.frequency === "daily" && data.recurrence.until) {
        const untilDate = data.recurrence.until.toDate
          ? data.recurrence.until.toDate()
          : new Date(data.recurrence.until);

        // const rule = new RRule({
        //   freq: RRule.DAILY,
        //   interval: data.recurrence.interval || 1,
        //   dtstart: new Date(baseDate),
        //   until: untilDate,
        // });

        

        // const occurrences = rule.all();
        const ruleSet = new RRuleSet();

        ruleSet.rrule(
            new RRule({
              freq: RRule.DAILY,
              interval: data.recurrence.interval || 1,
              dtstart: new Date(baseDate),
              until: untilDate,
            })
          );

          if (data.excludedDates && Array.isArray(data.excludedDates)) {
            const exDates = data.excludedDates.map((d: any) =>
              d.toDate ? d.toDate() : new Date(d)
            );
            exDates.forEach((d) => ruleSet.exdate(d));
          }

          const occurrences = ruleSet.all();

        for (const occurrenceDate of occurrences) {
          events.push({
            ...baseEvent,
            date: dayjs(occurrenceDate).tz("Asia/Ho_Chi_Minh").toISOString(),
          });
        }
      } else {
        // Sự kiện không lặp
        events.push({
          ...baseEvent,
          date: dayjs(baseDate).tz("Asia/Ho_Chi_Minh").toISOString(),
        });
      }
    }

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
  
  // console.log("sessionClaims", sessionClaims);
  return (
    <div className="">
      <HeaderCal />
      <MainView eventsData={dbEvents as CalendarEventType[]} />
    </div>
  );
}
