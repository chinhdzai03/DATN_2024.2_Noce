import { useDateStore, useEventStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import dayjs from "dayjs";
import React, { useEffect, useState } from "react";
import { ScrollArea } from "../ui/scroll-area"; 
import { getHours, isCurrentDay } from "@/lib/getTime";
import { EventRenderer } from "./event-renderer";
import { getQuarterHours } from "@/lib/getTime";
import { EventRangeModal } from "./event-popover";


export default function DayView() {
  const [currentTime, setCurrentTime] = useState(dayjs());
  const { openPopover, events, setSelectedTime, openEventSummary } = useEventStore();
  const { userSelectedDate, setDate } = useDateStore();

  // State cho kéo-thả chọn range
  const [selecting, setSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState<dayjs.Dayjs | null>(null);
  const [selectionEnd, setSelectionEnd] = useState<dayjs.Dayjs | null>(null);
  const [showRangeModal, setShowRangeModal] = useState(false);
  const [rangeFrom, setRangeFrom] = useState("");
  const [rangeTo, setRangeTo] = useState("");
  const [rangeDate, setRangeDate] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(dayjs());
    }, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setShowRangeModal(false);
    setRangeFrom("");
    setRangeTo("");
    setRangeDate("");
  }, [userSelectedDate]);

  const isToday =
    userSelectedDate.format("DD-MM-YY") === dayjs().format("DD-MM-YY");

  // Render event range block
  const eventRanges = events.filter(event =>
    typeof event.fromTime === 'string' &&
    typeof event.toTime === 'string' &&
    /^\d{2}:\d{2}$/.test(event.fromTime) &&
    /^\d{2}:\d{2}$/.test(event.toTime) &&
    event.fromTime !== event.toTime &&
    userSelectedDate.format("DD-MM-YY") === dayjs(event.date).format("DD-MM-YY")
  );

  return (
    <>
      <div className="grid grid-cols-[auto_auto_1fr] px-4">
        <div className="w-16 border-r border-gray-300 text-xs">GMT +7</div>
        <div className="flex w-16 flex-col items-center">
          <div className={cn("text-xs", isToday && "text-blue-600")}>
            {userSelectedDate.format("ddd")}{" "}
          </div>{" "}
          <div
            className={cn(
              "h-12 w-12 rounded-full p-2 text-2xl",
              isToday && "bg-blue-600 text-white text-center",
            )}
          >
            {userSelectedDate.format("DD")}{" "}
          </div>
        </div>
        <div></div>
      </div>

      <ScrollArea className="h-[70vh]">
        <div className="grid grid-cols-[auto_1fr] p-4">
          {/* Time Column */}
          <div className="w-16 border-r border-gray-300">
            {getQuarterHours.map((quarter, index) => (
              <div key={index} className="relative h-8">
                {/* Chỉ hiển thị label giờ đầu mỗi giờ */}
                {quarter.minute() === 0 && (
                  <div className="absolute -top-2 text-xs text-gray-600">
                    {quarter.format("HH:mm")}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Day/Boxes Column */}
          <div className="relative border-r border-gray-300" style={{minHeight: getQuarterHours.length * 32}}>
            {/* Render event range block cho cả ngày */}
            {eventRanges.map(event => {
              const fromTime = String(event.fromTime);
              const toTime = String(event.toTime);
              // Tính vị trí top/height
              const [fh, fm] = fromTime.split(":").map(Number);
              const [th, tm] = toTime.split(":").map(Number);
              let start = fh * 60 + fm;
              let end = th * 60 + tm;
              if (end <= start) end += 24 * 60;
              const totalMinutes = 24 * 60;
              const top = (start / totalMinutes) * 100;
              const height = ((end - start ) / totalMinutes) * 100;
              return (
                <div
                  key={event.id}
                  style={{
                    position: "absolute",
                    left: 70,
                    right: 70,
                    top: `${top}%`,
                    height: `calc(${height}% - 4px)` ,
                    background: "#039BE5",
                    zIndex: 1,
                    display: "flex",
                    alignItems: "start",
                    boxShadow: "0 0 10px 0 rgba(0, 0, 0, 0.4)",

                  }}
                  onClick={e => {
                    e.stopPropagation();
                    openEventSummary(event);
                  }}
                  className="!bg-[#039BE5] w-[90%] rounded-sm p-1 text-sm text-white cursor-pointer shadow"
                >
                  <div className="flex flex-col">
                          <div className=" font-semibold">{event.title}</div>
                          <div className="">{event.fromTime} - {event.toTime}</div>
                  </div>
                </div>
              );
            })}
            {/* Render từng slot 15 phút */}
            {getQuarterHours.map((quarter, i) => {
              const cellDate = userSelectedDate.hour(quarter.hour()).minute(quarter.minute());
              const isSelected = selectionStart && selectionEnd &&
                (cellDate.isSame(selectionStart) || cellDate.isSame(selectionEnd) ||
                  (cellDate.isAfter(selectionStart) && cellDate.isBefore(selectionEnd)) ||
                  (cellDate.isBefore(selectionStart) && cellDate.isAfter(selectionEnd)));
              return (
                <div
                  key={i}
                  className={cn(
                    "relative flex h-8 cursor-pointer flex-col items-center gap-y-2 border-b border-gray-300 hover:bg-gray-100",
                    isSelected && "bg-blue-200"
                  )}
                  onMouseDown={() => {
                    setSelecting(true);
                    setSelectionStart(cellDate);
                    setSelectionEnd(cellDate);
                  }}
                  onMouseEnter={() => {
                    if (selecting) setSelectionEnd(cellDate);
                  }}
                  onMouseUp={() => {
                    setSelecting(false);
                    if (selectionStart && selectionEnd && !selectionStart.isSame(selectionEnd)) {
                      setRangeDate(selectionStart.format("YYYY-MM-DD"));
                      const from = selectionStart.isBefore(selectionEnd) ? selectionStart : selectionEnd;
                      const to = selectionStart.isAfter(selectionEnd) ? selectionStart : selectionEnd;
                      setRangeFrom(from.format("HH:mm"));
                      setRangeTo(to.add(15, "minute").format("HH:mm"));
                      setShowRangeModal(true);
                    }
                  }}
                  onClick={() => {
                    setDate(cellDate);
                    setSelectedTime(cellDate.format("HH:mm"));
                    openPopover();
                  }}
                >
                  <EventRenderer
                    events={events.filter(ev =>
                      !ev.fromTime ||
                      !ev.toTime ||
                      !/^\d{2}:\d{2}$/.test(ev.fromTime) ||
                      !/^\d{2}:\d{2}$/.test(ev.toTime) ||
                      ev.fromTime === ev.toTime // event thường (1 slot)
                    )}
                    date={cellDate}
                    view="day"
                  />
                </div>
              );
            })}
            {/* Current time indicator */}
            {isCurrentDay(userSelectedDate) && (
              <div
                className={cn("absolute h-0.5 w-full bg-red-500")}
                style={{
                  top: `${(currentTime.hour() * 4 + currentTime.minute() / 15) / (24 * 4) * 100}%`,
                }}
              />
            )}
          </div>
        </div>
      </ScrollArea>
      {/* Modal tạo event range */}
      <EventRangeModal
        isOpen={showRangeModal}
        onClose={() => setShowRangeModal(false)}
        date={rangeDate}
        fromTime={rangeFrom}
        toTime={rangeTo}
        onFromTimeChange={setRangeFrom}
        onToTimeChange={setRangeTo}
      />
    </>
  );
}
