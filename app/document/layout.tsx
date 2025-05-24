'use client'

import Sidebar from "@/components/Notion/Sidebar";
import React, { useRef, useState } from 'react';

export default function DocumentLayout({ children }: { children: React.ReactNode }) {
  const [sidebarWidth, setSidebarWidth] = useState(240);
  const isResizing = useRef(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    isResizing.current = true;
    document.body.style.cursor = 'col-resize';
  };

  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing.current) return;
      const newWidth = Math.min(400, Math.max(180, e.clientX));
      setSidebarWidth(newWidth);
    };
    const handleMouseUp = () => {
      isResizing.current = false;
      document.body.style.cursor = '';
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  return (
    <div className="flex min-h-screen">
      <div style={{ width: sidebarWidth, minWidth: 180, maxWidth: 400 }} className="relative  bg-gray-100">
        <Sidebar />
        {/* Thanh kéo */}
        <div
          onMouseDown={handleMouseDown}
          style={{ right: 0, top: 0, width: 6, cursor: 'col-resize', zIndex: 50 }}
          className="absolute h-full bg-gray-300 hover:bg-gray-400 transition-colors"
        />
      </div>
      <div className="flex-1 pl-4 pr-4 bg-white overflow-y-auto ">
        {children}
      </div>
    </div>
  );
}