"use client";

import { useEffect } from "react";
import { CalendarEventType, useEventStore } from "@/lib/store";

export default function EventLoader() {
  const setEvents = useEventStore((state) => state.setEvents);
  const {events} = useEventStore();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch("/api/getEvents");
        const eventsData: CalendarEventType[] = await res.json();

        const mappedEvents: CalendarEventType[] = eventsData.map((event) => ({
          id: event.id,
          date: event.date,
          title: event.title,
          description: event.description,
          fromTime: event.fromTime,
          toTime: event.toTime,
          role: event.role,
          createdBy: event.createdBy,
          reply: event.reply,
        }));

        setEvents(mappedEvents);
      } catch (error) {
        console.error("Lỗi khi fetch sự kiện từ API:", error);
      }
    };

    fetchEvents();
  }, [setEvents ]);

  return null;
}
