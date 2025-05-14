"use client";

import React from "react";
import { Calendar, Menu } from "lucide-react";
import { Button } from "../ui/button";
import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from "react-icons/md";
import { useDateStore, useToggleSideBarStore, useViewStore } from "@/lib/store";
import dayjs from "dayjs";
import { useUser } from "@clerk/nextjs";

export default function HeaderLeft() {
  const todaysDate = dayjs();
  const { userSelectedDate, setDate, setMonth, selectedMonthIndex } =
    useDateStore();

  const { setSideBarOpen } = useToggleSideBarStore();

  const { selectedView } = useViewStore();

  const { user } = useUser();

  const handleTodayClick = () => {
    switch (selectedView) {
      case "month":
        setMonth(dayjs().month());
        break;
      case "week":
        setDate(todaysDate);
        break;
      case "day":
        setDate(todaysDate);
        setMonth(dayjs().month());
        break;
      default:
        break;
    }
  };

  const handlePrevClick = () => {
    switch (selectedView) {
      case "month":
        setMonth(selectedMonthIndex - 1);
        break;
      case "week":
        setDate(userSelectedDate.subtract(1, "week"));
        break;
      case "day":
        setDate(userSelectedDate.subtract(1, "day"));
        break;
      default:
        break;
    }
  };

  const handleNextClick = () => {
    switch (selectedView) {
      case "month":
        setMonth(selectedMonthIndex + 1);
        break;
      case "week":
        setDate(userSelectedDate.add(1, "week"));
        break;
      case "day":
        setDate(userSelectedDate.add(1, "day"));
        break;
      default:
        break;
    }
  };

  return (
    <div className="flex items-center gap-3">
      {/* Sidebar Toggle and Calendar Icon */}
      <div className="hidden items-center lg:flex">
        <Button
          variant="ghost"
          className="rounded-full p-2"
          onClick={() => setSideBarOpen()}
        >
          <Menu className="size-6" />
        </Button>
        <Calendar className='ml-2'/>
        
        <h1 className="text-xl ml-2"> {user?.firstName} {`'s`} Calendar</h1>
      </div>

      {/* Today Button */}
      <Button variant="outline" onClick={handleTodayClick}>
        Today
      </Button>

      {/* Navigation Controls */}
      <div className="flex items-center gap-3">
        <MdKeyboardArrowLeft
          className="size-6 cursor-pointer font-bold"
          onClick={handlePrevClick}
        />
        <MdKeyboardArrowRight
          className="size-6 cursor-pointer font-bold"
          onClick={handleNextClick}
        />
      </div>

      {/* Current Month and Year Display */}
      <h1 className="hidden text-xl lg:block">
        {dayjs(new Date(dayjs().year(), selectedMonthIndex)).format(
          "MMMM YYYY",
        )}
      </h1>
    </div>
  );
}
