import { getQuarterHours, getWeekDays } from "@/lib/getTime";
import { useDateStore, useEventStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import dayjs from "dayjs";
import React, { useEffect, useState } from "react";
import { ScrollArea } from "../ui/scroll-area"; 
import { EventRenderer } from "./event-renderer";
import { EventRangeModal } from "./event-popover";


export default function WeekView() {
  const [currentTime, setCurrentTime] = useState(dayjs());
  const { openPopover, events, setSelectedTime, openEventSummary } = useEventStore();

  const { userSelectedDate, setDate } = useDateStore();

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
  // console.log("all events", events);

  return (
    <>
      <div className="grid grid-cols-[auto_1fr_1fr_1fr_1fr_1fr_1fr_1fr] place-items-center px-4 py-2">
        <div className="w-16 border-r border-gray-300">
          <div className="relative h-16">
            <div className="absolute top-2 text-xs text-gray-600">GMT +7</div>
          </div>
        </div>

        {/* Week View Header */}

        {getWeekDays(userSelectedDate).map(({ currentDate, today }, index) => (
          <div key={index} className="flex flex-col items-center">
            <div className={cn("text-xs ", today && "text-blue-600")}>
              {currentDate.format("ddd")}
            </div>
            <div
              className={cn(
                "h-12 w-12 rounded-full p-2 text-2xl",
                today && "bg-blue-600 text-white text-center",
              )}
            >
              {currentDate.format("DD")}{" "}
            </div>
          </div>
        ))}
      </div>

      {/* Time Column & Corresponding Boxes of time per each date  */}

      <ScrollArea className="h-[70vh]">
        <div className="grid grid-cols-[auto_1fr_1fr_1fr_1fr_1fr_1fr_1fr] px-4 py-2">
          {/* Time Column */}
          <div className="w-16 border-r border-gray-300">
            {getQuarterHours.map((quarter, index) => (
              <div key={index} className="relative h-8">
                {quarter.minute() === 0 && (
                  <div className="absolute -top-2 text-xs text-gray-600">
                    {quarter.format("HH:mm")}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Week Days Corresponding Boxes */}

          {getWeekDays(userSelectedDate).map(
            ({ isCurrentDay, today }, index) => {
              const dayDate = userSelectedDate
                .startOf("week")
                .add(index, "day");

              const eventRanges = events.filter(event =>
                typeof event.fromTime === 'string' &&
                typeof event.toTime === 'string' &&
                /^\d{2}:\d{2}$/.test(event.fromTime) &&
                /^\d{2}:\d{2}$/.test(event.toTime) &&
                event.fromTime !== event.toTime &&
                dayDate.format("DD-MM-YY") === dayjs(event.date).format("DD-MM-YY")
              );
              // console.log("event range for day", dayDate.format("YYYY-MM-DD"), eventRanges);

              return (
                <div key={index} className="relative border-r border-gray-300" style={{minHeight: getQuarterHours.length * 32}}>
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
                          left: 8,
                          right: 4,
                          top: `${top}%`,
                          height: `calc(${height}% - 2px)` ,
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
                  {/* Render event thường trong từng slot */}
                  {getQuarterHours.map((quarter, i) => {
                    const cellDate = dayDate.hour(quarter.hour()).minute(quarter.minute());
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
                            setRangeTo(to.format("HH:mm"));
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
                          view="week"
                        />
                      </div>
                    );
                  })}
                  {/* Current time indicator */}

                  {isCurrentDay(dayDate) && today && (
                    <div
                      className={cn("absolute h-0.5 w-full bg-red-500")}
                      style={{
                        top: `${(currentTime.hour() * 4 + currentTime.minute() / 15) / (24 * 4) * 100}%`,
                      }}
                    />
                  )}
                </div>
              );
            },
          )}
        </div>
      </ScrollArea>

      {/* Modal tạo event theo khoảng thời gian */}
      <EventRangeModal
        isOpen={showRangeModal}
        onClose={() => setShowRangeModal(false)}
        date={rangeDate}
        fromTime={rangeFrom}
        toTime={rangeTo}
        onFromTimeChange={setRangeFrom}
        onToTimeChange={setRangeTo}
        fromTimeInitial={rangeFrom}
        toTimeInitial={rangeTo}
      />
    </>
  );
}
