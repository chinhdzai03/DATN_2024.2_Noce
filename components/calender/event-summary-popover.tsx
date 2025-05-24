'use client'

import React, { useRef, useEffect, useState } from 'react'
import dayjs from 'dayjs'
import { Button } from "@/components/ui/button"
import { IoCloseSharp } from "react-icons/io5"
import { CalendarEventType } from '@/lib/store'
import { deleteEvent } from "@/actions/event-actions"
import { toast } from "sonner"

interface EventSummaryPopoverProps {
  isOpen: boolean
  onClose: () => void
  event: CalendarEventType
}

export function EventSummaryPopover({ isOpen, onClose, event }: EventSummaryPopoverProps) {
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const popoverRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onClose])

  const handleDelete = async () => {
    if (!event.id) return;
    setDeleteError(null);
    const result = await deleteEvent(event.id);
    if (result.success) {
      toast.success("Event deleted successfully!");
      setShowConfirm(false);
      onClose();
    } else {
      toast.error(result.error || "Failed to delete event. Please try again.");
      setDeleteError(result.error || "Failed to delete event. Please try again.");
    }
  };
  console.log(event)

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-50"
      onClick={onClose}
    >
      <div
        ref={popoverRef}
        className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Event Summary</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <IoCloseSharp className="h-4 w-4" />
          </Button>
        </div>
        <div className="space-y-2">
          <p><strong>Title:</strong> {event.title}</p>
          {/* Format the date before displaying it */}
          <p><strong>Date:</strong> {dayjs(event.date).format("dddd, MMMM D, YYYY h:mm A")}</p>
          {event.role === 'guest' && (
            <p><strong>Created By:</strong> {event.createdBy || "Unknown"}</p>
          )}
          {/* Add more event details here */}
          {event.role === 'owner' && (
            <div className='flex justify-end'>
              <Button
                variant="destructive"
                onClick={() => setShowConfirm(true)}
                className="mt-4"
              >
                Delete Event
              </Button>
            </div>
          )}
          {deleteError && <p className="text-red-500 mt-2 ">{deleteError}</p>}
        </div>

        {/* Popup xác nhận xóa */}
        {showConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-lg p-6 shadow-lg max-w-xs w-full">
              <h3 className="text-lg font-semibold mb-4">Are you absolutely sure Delete?</h3>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowConfirm(false)}>
                  No
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                >
                  Yes
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
