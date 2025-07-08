"use client";

import { useEffect, useRef } from "react";
import { useEventStore } from "@/lib/store";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { toast } from "sonner";
dayjs.extend(utc);
dayjs.extend(timezone);

export default function GlobalNotifier() {
  const notifiedEvents = useRef<Set<string>>(new Set());

  useEffect(() => {
    const stored = sessionStorage.getItem("notifiedEvents");
    if (stored) {
        notifiedEvents.current = new Set(JSON.parse(stored));
    }
    }, []);

//   const { events } = useEventStore();

    useEffect(() => {
    const interval = setInterval(() => {
        const now = dayjs().tz("Asia/Ho_Chi_Minh");
        const currentEvents = useEventStore.getState().events;
        
        currentEvents.forEach((event) => {
        //   console.log("event", event);
          if (!event.date || !event.fromTime) return;
  
          const eventStart = dayjs(`${dayjs(event.date).format("YYYY-MM-DD")}T${event.fromTime}`).tz("Asia/Ho_Chi_Minh");
          const diff = eventStart.diff(now, "minute");
        //   console.log("diff", diff, "eventStart", eventStart.format("YYYY-MM-DD HH:mm:ss"), "now", now.format("YYYY-MM-DD HH:mm:ss"));
           if ( diff <= 15 && diff > 0 && !notifiedEvents.current.has(event.id)) {
              notifiedEvents.current.add(event.id);
  
              toast(`📅 Còn ${diff + 1} phút tới sự kiện đến sự kiện: ${event.title}`, {
                description: `Bắt đầu lúc ${event.fromTime}`,
                duration: 15000,
                action: {
                  label: "Xem",
                  onClick: () => {
                    window.location.href = `/calender`;
                  },
                },
              });
  
              // const audio = new Audio("/notification.mp3");
              // audio.play().catch(() => {});
          }
        });
      }, 10000); 
  
      return () => clearInterval(interval);
    }, []);

     return null;
}