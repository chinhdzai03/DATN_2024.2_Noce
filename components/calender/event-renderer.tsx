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
      if (
        typeof event.fromTime === 'string' &&
        typeof event.toTime === 'string' &&
        /^\d{2}:\d{2}$/.test(event.fromTime) &&
        /^\d{2}:\d{2}$/.test(event.toTime)
      ) {
        const slot = date.format("HH:mm");
        const from = event.fromTime;
        const to = event.toTime;
        if (from <= to) {
          return (
            dayjs(event.date).format("DD-MM-YY") === date.format("DD-MM-YY") &&
            slot >= from && slot < to
          );
        } else {
          return (
            dayjs(event.date).format("DD-MM-YY") === date.format("DD-MM-YY") &&
            (slot >= from || slot < to)
          );
        }
      } else {
        return dayjs(event.date).format("DD-MM-YY HH:mm") === date.format("DD-MM-YY HH:mm");
      }
    }
  });

  // Tính số slot 15 phút giữa fromTime và toTime
  const getRangeSlotCount = (from: string, to: string) => {
    const [fh, fm] = from.split(":").map(Number);
    const [th, tm] = to.split(":").map(Number);
    let start = fh * 60 + fm;
    let end = th * 60 + tm;
    if (end <= start) end += 24 * 60; // qua ngày
    return Math.max(1, Math.round((end - start) / 15));
  };

  return (
    <>
      {view === "week" || view === "day"
        ? events.map((event) => {
            // Render event range chỉ ở slot fromTime
            if (
              typeof event.fromTime === 'string' &&
              typeof event.toTime === 'string' &&
              /^\d{2}:\d{2}$/.test(event.fromTime) &&
              /^\d{2}:\d{2}$/.test(event.toTime) &&
              event.fromTime !== event.toTime &&
              dayjs(event.date).format("DD-MM-YY") === date.format("DD-MM-YY") &&
              date.format("HH:mm") === event.fromTime
            ) {
              const slotCount = getRangeSlotCount(event.fromTime, event.toTime);
              return (
                <div
                  key={event.id}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: "4px",
                    right: "4px",
                    height: `calc(${slotCount} * 2rem - 4px)`,
                    background: "#039be5",
                    zIndex: 1,
                    display: "flex",
                    alignItems: "center",
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    openEventSummary(event);
                  }}
                  className="w-[90%] rounded-sm p-1 text-sm text-white cursor-pointer"
                >
                  {event.title}
                </div>
              );
            }
            // Event thường (không phải event range)
            if (
              (!event.fromTime &&
                dayjs(event.date).format("DD-MM-YY HH:mm") === date.format("DD-MM-YY HH:mm")) ||
              (event.fromTime && event.toTime && false) // Không render event range như event thường
            ) {
              return (
                <div
                  key={event.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    openEventSummary(event);
                  }}
                  className={`shadow-xl line-clamp-1 w-[90%] cursor-pointer rounded-sm p-1 text-sm text-white ${event.role === 'guest' ? 'bg-[#211C6A]' : 'bg-[#74E291]'}`}
                >
                  <p className="font-semibold">{event.title}</p>
                </div>
              );
            }
            return null;
          })
        : filteredEvents.map((event) => (
            <div
              key={event.id}
              onClick={(e) => {
                e.stopPropagation();
                openEventSummary(event);
              }}
              className={`shadow-xl line-clamp-1 w-[90%] cursor-pointer rounded-sm p-1 text-sm text-white ${event.role === 'guest' ? 'bg-[#211C6A]' : 'bg-[#74E291]'}`}
            >
              <p className="font-semibold">{event.title}</p>
            </div>
          ))}
    </>
  );
}
