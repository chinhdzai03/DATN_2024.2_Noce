import { CalendarEventType, useEventStore } from "@/lib/store";

import dayjs from "dayjs";
import React from "react";

type EventRendererProps = {
  date: dayjs.Dayjs;
  view: "month" | "week" | "day";
  events: CalendarEventType[];
};

export function EventRenderer({ date, view, events }: EventRendererProps) {
  const { openEventSummary } = useEventStore();

  const filteredEvents = events.filter((event: CalendarEventType) => {
    if (view === "month") {
      return dayjs(event.date).format("DD-MM-YY") === date.format("DD-MM-YY");
    } else if (view === "week" || view === "day") {
      return dayjs(event.date).format("DD-MM-YY HH") === date.format("DD-MM-YY HH");
    }
  });

  return (
    <>
      {filteredEvents.map((event) => (
        <div
          key={event.id}
          onClick={(e) => {
            e.stopPropagation();
            openEventSummary(event);
          }}
          className={`line-clamp-1 w-[90%] cursor-pointer rounded-sm p-1 text-sm text-white ${event.role === 'guest' ? 'bg-blue-500' : 'bg-green-700'}`}
        >
          {event.title}
        </div>
      ))}
    </>
  );
}
